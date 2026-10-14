package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.dto.UserProfileDto;
import com.lmslite.entity.AuditLog;
import com.lmslite.entity.Role;
import com.lmslite.entity.SystemConfig;
import com.lmslite.repository.SystemConfigRepository;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.AuditLogService;
import com.lmslite.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private SystemConfigRepository configRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<UserProfileDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        try {
            UserProfileDto updated = userService.toggleUserStatus(id, admin.getId(), admin.getUsername());
            return ResponseEntity.ok(ApiResponse.success("User status toggled", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        try {
            Role role = Role.valueOf(payload.get("role"));
            UserProfileDto updated = userService.updateUserRole(id, role, admin.getId(), admin.getUsername());
            return ResponseEntity.ok(ApiResponse.success("User role updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        List<AuditLog> logs = auditLogService.getRecentLogs();
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    @GetMapping("/system-config")
    public ResponseEntity<?> getSystemConfigs() {
        List<SystemConfig> configs = configRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("System configurations retrieved", configs));
    }

    @PostMapping("/system-config")
    public ResponseEntity<?> saveSystemConfig(@RequestBody Map<String, String> payload) {
        String key = payload.get("key");
        String value = payload.get("value");
        String description = payload.getOrDefault("description", "");

        SystemConfig config = configRepository.findByConfigKey(key)
                .orElse(new SystemConfig(key, value, description));
        config.setConfigValue(value);
        config.setLastUpdated(LocalDateTime.now());
        config = configRepository.save(config);

        return ResponseEntity.ok(ApiResponse.success("Configuration saved", config));
    }
}
