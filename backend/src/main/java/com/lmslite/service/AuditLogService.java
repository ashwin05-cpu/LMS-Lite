package com.lmslite.service;

import com.lmslite.entity.AuditLog;
import com.lmslite.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(Long userId, String username, String role, String action, String resource, String details, String ipAddress) {
        try {
            AuditLog log = new AuditLog(userId, username, role, action, resource, details, ipAddress);
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Non-blocking log persistence
        }
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
