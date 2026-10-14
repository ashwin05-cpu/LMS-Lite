package com.lmslite.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lmslite.dto.AssessmentDto;
import com.lmslite.dto.SubmissionDto;
import com.lmslite.entity.*;
import com.lmslite.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentSubmissionRepository submissionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<AssessmentDto> getCourseAssessments(Long courseId, Long studentId) {
        List<Assessment> assessments = assessmentRepository.findByCourseIdOrderByDueDateAsc(courseId);
        return assessments.stream().map(a -> toDto(a, studentId)).collect(Collectors.toList());
    }

    public AssessmentDto getAssessmentById(Long assessmentId, Long studentId) {
        Assessment a = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + assessmentId));
        return toDto(a, studentId);
    }

    @Transactional
    public AssessmentDto createAssessment(AssessmentDto dto, Long instructorId) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));

        Assessment a = new Assessment();
        a.setCourse(course);
        a.setTitle(dto.getTitle());
        a.setDescription(dto.getDescription());
        a.setType(dto.getType() != null ? dto.getType() : AssessmentType.QUIZ);
        a.setTotalPoints(dto.getTotalPoints() != null ? dto.getTotalPoints() : 100);
        a.setDueDate(dto.getDueDate());
        a.setTimeLimit(dto.getTimeLimit() != null ? dto.getTimeLimit() : 30);
        a.setAttempts(dto.getAttempts() != null ? dto.getAttempts() : 1);
        a.setPassingScore(dto.getPassingScore() != null ? dto.getPassingScore() : 60);
        a.setQuestionsJson(dto.getQuestionsJson());

        a = assessmentRepository.save(a);
        return toDto(a, null);
    }

    @Transactional
    public AssessmentDto updateAssessment(Long assessmentId, AssessmentDto dto) {
        Assessment a = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + assessmentId));

        if (dto.getTitle() != null) a.setTitle(dto.getTitle());
        if (dto.getDescription() != null) a.setDescription(dto.getDescription());
        if (dto.getType() != null) a.setType(dto.getType());
        if (dto.getTotalPoints() != null) a.setTotalPoints(dto.getTotalPoints());
        if (dto.getDueDate() != null) a.setDueDate(dto.getDueDate());
        if (dto.getTimeLimit() != null) a.setTimeLimit(dto.getTimeLimit());
        if (dto.getAttempts() != null) a.setAttempts(dto.getAttempts());
        if (dto.getPassingScore() != null) a.setPassingScore(dto.getPassingScore());
        if (dto.getQuestionsJson() != null) a.setQuestionsJson(dto.getQuestionsJson());

        a = assessmentRepository.save(a);
        return toDto(a, null);
    }

    @Transactional
    public SubmissionDto submitAssessment(Long assessmentId, Long studentId, SubmissionDto submissionDto) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + assessmentId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Check attempts
        List<AssessmentSubmission> existingSubmissions = submissionRepository.findByAssessmentIdAndStudentId(assessmentId, studentId);
        int currentAttempt = existingSubmissions.size() + 1;
        if (currentAttempt > assessment.getAttempts()) {
            throw new RuntimeException("Maximum attempts (" + assessment.getAttempts() + ") exceeded for this assessment");
        }

        AssessmentSubmission submission = new AssessmentSubmission();
        submission.setAssessment(assessment);
        submission.setStudent(student);
        submission.setAttemptNumber(currentAttempt);
        submission.setSubmissionDate(LocalDateTime.now());
        submission.setAnswersJson(submissionDto.getAnswersJson());
        submission.setFileUrl(submissionDto.getFileUrl());
        submission.setSubmissionText(submissionDto.getSubmissionText());

        // Check if submitted late
        boolean isLate = LocalDateTime.now().isAfter(assessment.getDueDate());
        submission.setStatus(isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED);

        // Automated grading for Quiz objective questions (FR6)
        if (assessment.getType() == AssessmentType.QUIZ && submissionDto.getAnswersJson() != null) {
            Double autoScore = autoGradeQuiz(assessment.getQuestionsJson(), submissionDto.getAnswersJson());
            if (autoScore != null) {
                submission.setScore(autoScore);
                submission.setStatus(SubmissionStatus.GRADED);
                submission.setGradedDate(LocalDateTime.now());

                // Auto-record in Gradebook
                recordGrade(student, assessment, autoScore, null, "Auto-graded Quiz");
            }
        }

        submission = submissionRepository.save(submission);

        auditLogService.log(student.getId(), student.getUsername(), student.getRole().name(),
                "SUBMIT_ASSESSMENT", "Assessment", "Submitted assessment " + assessment.getTitle(), null);

        return toSubmissionDto(submission);
    }

    private Double autoGradeQuiz(String questionsJson, String answersJson) {
        if (questionsJson == null || answersJson == null) return null;
        try {
            List<Map<String, Object>> questions = objectMapper.readValue(questionsJson, new TypeReference<>() {});
            Map<String, Object> answers = objectMapper.readValue(answersJson, new TypeReference<>() {});

            double totalEarned = 0;
            double totalPossible = 0;
            boolean hasSubjective = false;

            for (Map<String, Object> q : questions) {
                String qId = String.valueOf(q.get("id"));
                String qType = (String) q.get("type"); // "MULTIPLE_CHOICE", "TRUE_FALSE", "ESSAY", "SHORT_ANSWER"
                Number pts = (Number) q.getOrDefault("points", 10);
                double points = pts.doubleValue();
                totalPossible += points;

                if ("MULTIPLE_CHOICE".equalsIgnoreCase(qType) || "TRUE_FALSE".equalsIgnoreCase(qType)) {
                    Object correctAns = q.get("correctAnswer");
                    Object studentAns = answers.get(qId);
                    if (correctAns != null && studentAns != null &&
                            String.valueOf(correctAns).trim().equalsIgnoreCase(String.valueOf(studentAns).trim())) {
                        totalEarned += points;
                    }
                } else {
                    hasSubjective = true;
                }
            }

            if (totalPossible > 0 && !hasSubjective) {
                return Math.round((totalEarned / totalPossible) * 100.0 * 100.0) / 100.0;
            }
        } catch (Exception e) {
            // If json parsing fails, leave for manual grading
        }
        return null;
    }

    public void recordGrade(User student, Assessment assessment, Double points, User grader, String feedback) {
        Grade grade = gradeRepository.findByStudentIdAndAssessmentId(student.getId(), assessment.getId())
                .orElse(new Grade());

        grade.setStudent(student);
        grade.setCourse(assessment.getCourse());
        grade.setAssessment(assessment);
        grade.setPoints(points);
        grade.setMaxPoints(assessment.getTotalPoints().doubleValue());
        grade.setGradedBy(grader);
        grade.setGradedDate(LocalDateTime.now());
        grade.setFeedback(feedback);

        // Calculate Letter Grade
        double percentage = (points / assessment.getTotalPoints()) * 100.0;
        String letter;
        if (percentage >= 90) letter = "A";
        else if (percentage >= 80) letter = "B";
        else if (percentage >= 70) letter = "C";
        else if (percentage >= 60) letter = "D";
        else letter = "F";
        grade.setLetterGrade(letter);

        gradeRepository.save(grade);

        notificationService.createNotification(student,
                "Grade posted for " + assessment.getTitle() + ": " + points + "/" + assessment.getTotalPoints() + " (" + letter + ")",
                "GRADE_POSTED", assessment.getCourse().getId(), "/grades");
    }

    public List<SubmissionDto> getSubmissionsForAssessment(Long assessmentId) {
        return submissionRepository.findByAssessmentId(assessmentId).stream()
                .map(this::toSubmissionDto)
                .collect(Collectors.toList());
    }

    public List<SubmissionDto> getSubmissionsForCourse(Long courseId) {
        return submissionRepository.findByCourseId(courseId).stream()
                .map(this::toSubmissionDto)
                .collect(Collectors.toList());
    }

    public AssessmentDto toDto(Assessment a, Long studentId) {
        AssessmentDto dto = new AssessmentDto();
        dto.setId(a.getId());
        dto.setCourseId(a.getCourse().getId());
        dto.setCourseTitle(a.getCourse().getTitle());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setType(a.getType());
        dto.setTotalPoints(a.getTotalPoints());
        dto.setDueDate(a.getDueDate());
        dto.setTimeLimit(a.getTimeLimit());
        dto.setAttempts(a.getAttempts());
        dto.setPassingScore(a.getPassingScore());
        dto.setQuestionsJson(a.getQuestionsJson());

        if (studentId != null) {
            List<AssessmentSubmission> userSubs = submissionRepository.findByAssessmentIdAndStudentId(a.getId(), studentId);
            dto.setUserAttempts(userSubs.size());
            if (!userSubs.isEmpty()) {
                dto.setIsSubmitted(true);
                AssessmentSubmission latest = userSubs.get(userSubs.size() - 1);
                dto.setUserScore(latest.getScore());
                dto.setUserFeedback(latest.getFeedback());
            }
        }
        return dto;
    }

    public SubmissionDto toSubmissionDto(AssessmentSubmission s) {
        SubmissionDto dto = new SubmissionDto();
        dto.setId(s.getId());
        dto.setAssessmentId(s.getAssessment().getId());
        dto.setAssessmentTitle(s.getAssessment().getTitle());
        dto.setCourseId(s.getAssessment().getCourse().getId());
        dto.setCourseTitle(s.getAssessment().getCourse().getTitle());
        dto.setStudentId(s.getStudent().getId());
        dto.setStudentName(s.getStudent().getFullName());
        dto.setStudentCode(s.getStudent().getStudentId());
        dto.setSubmissionDate(s.getSubmissionDate());
        dto.setScore(s.getScore());
        dto.setAttemptNumber(s.getAttemptNumber());
        dto.setAnswersJson(s.getAnswersJson());
        dto.setFileUrl(s.getFileUrl());
        dto.setSubmissionText(s.getSubmissionText());
        dto.setFeedback(s.getFeedback());
        if (s.getGradedBy() != null) {
            dto.setGradedById(s.getGradedBy().getId());
            dto.setGradedByName(s.getGradedBy().getFullName());
        }
        dto.setGradedDate(s.getGradedDate());
        dto.setStatus(s.getStatus());
        return dto;
    }
}
