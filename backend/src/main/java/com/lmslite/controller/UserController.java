package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.dto.UserProfileDto;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserProfileDto profile = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody UserProfileDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            UserProfileDto updated = userService.updateUserProfile(userDetails.getId(), dto);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
