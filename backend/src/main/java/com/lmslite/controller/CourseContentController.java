package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.dto.CourseContentDto;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.CourseContentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CourseContentController {

    @Autowired
    private CourseContentService courseContentService;

    @GetMapping("/{courseId}/content")
    public ResponseEntity<?> getCourseContents(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long studentId = userDetails != null ? userDetails.getId() : null;
        List<CourseContentDto> contentList = courseContentService.getCourseContents(courseId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Course content fetched", contentList));
    }

    @PostMapping("/{courseId}/content")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'CONTENT_CREATOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> addContent(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseContentDto dto) {
        try {
            CourseContentDto created = courseContentService.addContent(courseId, dto);
            return ResponseEntity.ok(ApiResponse.success("Content added successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/content/{contentId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'CONTENT_CREATOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> updateContent(
            @PathVariable Long contentId,
            @Valid @RequestBody CourseContentDto dto) {
        try {
            CourseContentDto updated = courseContentService.updateContent(contentId, dto);
            return ResponseEntity.ok(ApiResponse.success("Content updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/content/{contentId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN')")
    public ResponseEntity<?> deleteContent(@PathVariable Long contentId) {
        try {
            courseContentService.deleteContent(contentId);
            return ResponseEntity.ok(ApiResponse.success("Content deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/content/{contentId}/toggle-completion")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<?> toggleCompletion(
            @PathVariable Long contentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            courseContentService.toggleLessonCompletion(contentId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Lesson progress updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
