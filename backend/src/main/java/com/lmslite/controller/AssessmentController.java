package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.dto.AssessmentDto;
import com.lmslite.dto.SubmissionDto;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseAssessments(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long studentId = userDetails != null ? userDetails.getId() : null;
        List<AssessmentDto> list = assessmentService.getCourseAssessments(courseId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Assessments fetched", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssessmentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long studentId = userDetails != null ? userDetails.getId() : null;
        AssessmentDto dto = assessmentService.getAssessmentById(id, studentId);
        return ResponseEntity.ok(ApiResponse.success("Assessment details fetched", dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN')")
    public ResponseEntity<?> createAssessment(
            @Valid @RequestBody AssessmentDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            AssessmentDto created = assessmentService.createAssessment(dto, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Assessment created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN')")
    public ResponseEntity<?> updateAssessment(
            @PathVariable Long id,
            @Valid @RequestBody AssessmentDto dto) {
        try {
            AssessmentDto updated = assessmentService.updateAssessment(id, dto);
            return ResponseEntity.ok(ApiResponse.success("Assessment updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> submitAssessment(
            @PathVariable Long id,
            @RequestBody SubmissionDto submissionDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            SubmissionDto submitted = assessmentService.submitAssessment(id, userDetails.getId(), submissionDto);
            return ResponseEntity.ok(ApiResponse.success("Assessment submitted successfully", submitted));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> getSubmissions(@PathVariable Long id) {
        List<SubmissionDto> submissions = assessmentService.getSubmissionsForAssessment(id);
        return ResponseEntity.ok(ApiResponse.success("Submissions fetched", submissions));
    }

    @GetMapping("/course/{courseId}/submissions")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> getCourseSubmissions(@PathVariable Long courseId) {
        List<SubmissionDto> submissions = assessmentService.getSubmissionsForCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Course submissions fetched", submissions));
    }
}
