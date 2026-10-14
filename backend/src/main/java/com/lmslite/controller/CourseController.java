package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.dto.CourseDto;
import com.lmslite.entity.CourseDifficulty;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.CourseService;
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
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping("/public")
    public ResponseEntity<?> getPublicCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) CourseDifficulty difficulty,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        List<CourseDto> courses = courseService.getPublicCourses(search, category, difficulty, userId);
        return ResponseEntity.ok(ApiResponse.success("Courses fetched successfully", courses));
    }

    @GetMapping
    public ResponseEntity<?> getAllCourses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        List<CourseDto> courses = courseService.getAllCourses(userId);
        return ResponseEntity.ok(ApiResponse.success("All courses fetched", courses));
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'TEACHING_ASSISTANT', 'CONTENT_CREATOR', 'ADMIN')")
    public ResponseEntity<?> getInstructorCourses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<CourseDto> courses = courseService.getInstructorCourses(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Instructor courses fetched", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        CourseDto course = courseService.getCourseById(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Course details fetched", course));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN')")
    public ResponseEntity<?> createCourse(@Valid @RequestBody CourseDto courseDto,
                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            CourseDto created = courseService.createCourse(courseDto, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Course created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'CONTENT_CREATOR', 'ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id,
                                          @Valid @RequestBody CourseDto courseDto,
                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            CourseDto updated = courseService.updateCourse(id, courseDto, userDetails.getId(), isAdmin);
            return ResponseEntity.ok(ApiResponse.success("Course updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            courseService.deleteOrArchiveCourse(id, userDetails.getId(), isAdmin);
            return ResponseEntity.ok(ApiResponse.success("Course processed/archived successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
