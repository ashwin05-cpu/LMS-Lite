package com.lmslite.service;

import com.lmslite.entity.*;
import com.lmslite.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssessmentSubmissionRepository submissionRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getStudentAnalytics(Long studentId) {
        Map<String, Object> data = new HashMap<>();

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        long totalEnrolled = enrollments.size();
        long completedCourses = enrollments.stream().filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED || e.getProgressPercent() >= 100).count();

        Double overallAverage = gradeRepository.calculateOverallAverageForStudent(studentId);
        double avgScore = overallAverage != null ? Math.round(overallAverage * 100.0) / 100.0 : 0.0;

        // GPA calculation (4.0 scale)
        double gpa = (avgScore / 100.0) * 4.0;
        gpa = Math.round(gpa * 100.0) / 100.0;

        List<Map<String, Object>> courseProgressList = enrollments.stream().map(e -> {
            Map<String, Object> cp = new HashMap<>();
            cp.put("courseId", e.getCourse().getId());
            cp.put("courseCode", e.getCourse().getCourseCode());
            cp.put("courseTitle", e.getCourse().getTitle());
            cp.put("progressPercent", e.getProgressPercent());
            cp.put("status", e.getStatus().name());
            return cp;
        }).collect(Collectors.toList());

        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        List<Map<String, Object>> gradeHistory = grades.stream().map(g -> {
            Map<String, Object> gh = new HashMap<>();
            gh.put("assessmentTitle", g.getAssessment().getTitle());
            gh.put("courseCode", g.getCourse().getCourseCode());
            gh.put("points", g.getPoints());
            gh.put("maxPoints", g.getMaxPoints());
            gh.put("percentage", Math.round((g.getPoints() / g.getMaxPoints()) * 100.0));
            gh.put("letterGrade", g.getLetterGrade());
            return gh;
        }).collect(Collectors.toList());

        data.put("totalEnrolled", totalEnrolled);
        data.put("completedCourses", completedCourses);
        data.put("averageScore", avgScore);
        data.put("gpa", gpa);
        data.put("courseProgress", courseProgressList);
        data.put("gradeHistory", gradeHistory);

        return data;
    }

    public Map<String, Object> getInstructorAnalytics(Long instructorId) {
        Map<String, Object> data = new HashMap<>();

        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        long totalCourses = courses.size();

        long totalStudents = 0;
        for (Course c : courses) {
            totalStudents += courseRepository.countEnrolledStudents(c.getId());
        }

        Long pendingGrading = submissionRepository.countPendingGradingForInstructor(instructorId);

        // At-risk students identification (FR7 & FR10)
        List<Map<String, Object>> atRiskStudents = new ArrayList<>();
        for (Course c : courses) {
            List<Enrollment> enrs = enrollmentRepository.findByCourseId(c.getId());
            for (Enrollment enr : enrs) {
                if (enr.getStatus() == EnrollmentStatus.ENROLLED && enr.getProgressPercent() < 40) {
                    Map<String, Object> studentMap = new HashMap<>();
                    studentMap.put("studentName", enr.getStudent().getFullName());
                    studentMap.put("studentEmail", enr.getStudent().getEmail());
                    studentMap.put("courseTitle", c.getTitle());
                    studentMap.put("progressPercent", enr.getProgressPercent());
                    studentMap.put("reason", "Low content engagement (< 40% completed)");
                    atRiskStudents.add(studentMap);
                }
            }
        }

        data.put("totalCourses", totalCourses);
        data.put("totalStudents", totalStudents);
        data.put("pendingGrading", pendingGrading != null ? pendingGrading : 0);
        data.put("atRiskStudents", atRiskStudents);

        return data;
    }

    public Map<String, Object> getInstitutionalAnalytics() {
        Map<String, Object> data = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalStudents = userRepository.findByRole(Role.STUDENT).size();
        long totalInstructors = userRepository.findByRole(Role.INSTRUCTOR).size();
        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.findByStatus(CourseStatus.PUBLISHED).size();
        long totalEnrollments = enrollmentRepository.count();

        // Sample breakdown metrics
        Map<String, Long> userRoleBreakdown = new HashMap<>();
        for (Role r : Role.values()) {
            userRoleBreakdown.put(r.name(), (long) userRepository.findByRole(r).size());
        }

        data.put("totalUsers", totalUsers);
        data.put("totalStudents", totalStudents);
        data.put("totalInstructors", totalInstructors);
        data.put("totalCourses", totalCourses);
        data.put("publishedCourses", publishedCourses);
        data.put("totalEnrollments", totalEnrollments);
        data.put("userRoleBreakdown", userRoleBreakdown);

        return data;
    }
}
