package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/student")
    public ResponseEntity<?> getStudentAnalytics(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Map<String, Object> data = analyticsService.getStudentAnalytics(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Student analytics fetched", data));
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> getInstructorAnalytics(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Map<String, Object> data = analyticsService.getInstructorAnalytics(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Instructor analytics fetched", data));
    }

    @GetMapping("/institutional")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getInstitutionalAnalytics() {
        Map<String, Object> data = analyticsService.getInstitutionalAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Institutional analytics fetched", data));
    }
}
