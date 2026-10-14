package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.entity.Enrollment;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @PostMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> enrollStudent(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Enrollment enrollment = enrollmentService.enrollStudent(courseId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Successfully enrolled in course", enrollment));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/course/{courseId}/drop")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> dropCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            enrollmentService.dropCourse(courseId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Successfully dropped course"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> getMyEnrollments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Enrollment> enrollments = enrollmentService.getStudentEnrollments(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Student enrollments fetched", enrollments));
    }

    @GetMapping("/course/{courseId}/students")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> getCourseStudents(@PathVariable Long courseId) {
        List<Enrollment> enrollments = enrollmentService.getCourseEnrollments(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course enrollments fetched", enrollments));
    }
}
