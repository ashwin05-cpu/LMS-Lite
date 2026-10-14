package com.lmslite.service;

import com.lmslite.dto.EnrollmentDto;
import com.lmslite.entity.*;
import com.lmslite.repository.CourseRepository;
import com.lmslite.repository.EnrollmentRepository;
import com.lmslite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public Enrollment enrollStudent(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Check if course is published
        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new RuntimeException("Cannot enroll: Course is not active/published");
        }

        // Check already enrolled
        Optional<Enrollment> existing = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId);
        if (existing.isPresent()) {
            Enrollment e = existing.get();
            if (e.getStatus() == EnrollmentStatus.ENROLLED) {
                throw new RuntimeException("You are already enrolled in this course");
            } else if (e.getStatus() == EnrollmentStatus.DROPPED) {
                // Re-enroll
                e.setStatus(EnrollmentStatus.ENROLLED);
                e.setEnrollmentDate(LocalDateTime.now());
                return enrollmentRepository.save(e);
            }
        }

        // Business Rule: Students can enroll up to maximum course capacity (Appendix F)
        Long currentEnrolled = enrollmentRepository.countByCourseIdAndStatus(courseId, EnrollmentStatus.ENROLLED);
        if (currentEnrolled >= course.getMaxEnrollment()) {
            throw new RuntimeException("Course has reached maximum capacity (" + course.getMaxEnrollment() + " students)");
        }

        Enrollment enrollment = new Enrollment(course, student, EnrollmentStatus.ENROLLED);
        enrollment = enrollmentRepository.save(enrollment);

        // Notify student & instructor
        notificationService.createNotification(student, "You have successfully enrolled in " + course.getTitle(),
                "ENROLLMENT", course.getId(), "/courses/" + course.getId());

        if (course.getInstructor() != null) {
            notificationService.createNotification(course.getInstructor(),
                    student.getFullName() + " enrolled in " + course.getTitle(),
                    "ENROLLMENT", course.getId(), "/courses/" + course.getId());
        }

        auditLogService.log(student.getId(), student.getUsername(), student.getRole().name(),
                "ENROLL", "Enrollment", "Enrolled in course " + course.getCourseCode(), null);

        return enrollment;
    }

    @Transactional
    public void dropCourse(Long courseId, Long studentId) {
        Enrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);

        auditLogService.log(studentId, null, "STUDENT", "DROP_COURSE", "Enrollment",
                "Dropped course ID " + courseId, null);
    }

    public List<Enrollment> getStudentEnrollments(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getCourseEnrollments(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    public Optional<Enrollment> getEnrollment(Long courseId, Long studentId) {
        return enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId);
    }
}
