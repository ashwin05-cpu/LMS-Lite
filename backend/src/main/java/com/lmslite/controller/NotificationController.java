package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.entity.Notification;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Notification> notifications = notificationService.getUserNotifications(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long count = notificationService.getUnreadCount(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched", Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        notificationService.markAsRead(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
