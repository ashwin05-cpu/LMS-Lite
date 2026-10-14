package com.lmslite.service;

import com.lmslite.dto.GradeDto;
import com.lmslite.entity.*;
import com.lmslite.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GradeService {

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentSubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public GradeDto gradeSubmission(Long submissionId, Double score, String feedback, Long graderId) {
        // Validation: 0-100 range numeric (Appendix C)
        if (score < 0 || score > 100) {
            throw new RuntimeException("Score must be between 0-100");
        }

        AssessmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        User grader = userRepository.findById(graderId)
                .orElseThrow(() -> new RuntimeException("Grader not found with id: " + graderId));

        submission.setScore(score);
        submission.setFeedback(feedback);
        submission.setGradedBy(grader);
        submission.setGradedDate(LocalDateTime.now());
        submission.setStatus(SubmissionStatus.GRADED);
        submissionRepository.save(submission);

        // Update Grade entity
        Assessment assessment = submission.getAssessment();
        User student = submission.getStudent();

        Grade grade = gradeRepository.findByStudentIdAndAssessmentId(student.getId(), assessment.getId())
                .orElse(new Grade());

        grade.setStudent(student);
        grade.setCourse(assessment.getCourse());
        grade.setAssessment(assessment);
        grade.setPoints(score);
        grade.setMaxPoints(assessment.getTotalPoints().doubleValue());
        grade.setGradedBy(grader);
        grade.setGradedDate(LocalDateTime.now());
        grade.setFeedback(feedback);

        double pct = (score / assessment.getTotalPoints()) * 100.0;
        String letter;
        if (pct >= 90) letter = "A";
        else if (pct >= 80) letter = "B";
        else if (pct >= 70) letter = "C";
        else if (pct >= 60) letter = "D";
        else letter = "F";
        grade.setLetterGrade(letter);

        grade = gradeRepository.save(grade);

        notificationService.createNotification(student,
                "Your submission for " + assessment.getTitle() + " has been graded: " + score + "/" + assessment.getTotalPoints() + " (" + letter + ")",
                "GRADE_POSTED", assessment.getCourse().getId(), "/grades");

        auditLogService.log(grader.getId(), grader.getUsername(), grader.getRole().name(),
                "GRADE_SUBMISSION", "Grade", "Graded student " + student.getUsername() + " with " + score, null);

        return toDto(grade);
    }

    public List<GradeDto> getStudentGrades(Long studentId) {
        return gradeRepository.findByStudentId(studentId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<GradeDto> getCourseGrades(Long courseId) {
        return gradeRepository.findByCourseId(courseId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public GradeDto toDto(Grade g) {
        GradeDto dto = new GradeDto();
        dto.setId(g.getId());
        dto.setStudentId(g.getStudent().getId());
        dto.setStudentName(g.getStudent().getFullName());
        dto.setStudentCode(g.getStudent().getStudentId());
        dto.setCourseId(g.getCourse().getId());
        dto.setCourseTitle(g.getCourse().getTitle());
        dto.setAssessmentId(g.getAssessment().getId());
        dto.setAssessmentTitle(g.getAssessment().getTitle());
        dto.setPoints(g.getPoints());
        dto.setMaxPoints(g.getMaxPoints());
        if (g.getGradedBy() != null) {
            dto.setGradedById(g.getGradedBy().getId());
            dto.setGradedByName(g.getGradedBy().getFullName());
        }
        dto.setGradedDate(g.getGradedDate());
        dto.setFeedback(g.getFeedback());
        dto.setLetterGrade(g.getLetterGrade());
        return dto;
    }
}
