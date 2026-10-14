package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.dto.GradeDto;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.GradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GradeController {

    @Autowired
    private GradeService gradeService;

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> getMyGrades(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<GradeDto> grades = gradeService.getStudentGrades(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Student grades fetched", grades));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> getCourseGrades(@PathVariable Long courseId) {
        List<GradeDto> grades = gradeService.getCourseGrades(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course grades fetched", grades));
    }

    @PostMapping("/grade-submission/{submissionId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Number scoreNum = (Number) payload.get("score");
            if (scoreNum == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Score is required"));
            }
            Double score = scoreNum.doubleValue();
            String feedback = (String) payload.getOrDefault("feedback", "");

            GradeDto grade = gradeService.gradeSubmission(submissionId, score, feedback, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Submission graded successfully", grade));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
