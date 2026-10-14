package com.lmslite.service;

import com.lmslite.dto.UserProfileDto;
import com.lmslite.entity.Role;
import com.lmslite.entity.User;
import com.lmslite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return convertToDto(user);
    }

    public UserProfileDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return convertToDto(user);
    }

    @Transactional
    public UserProfileDto updateUserProfile(Long userId, UserProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getDepartment() != null) user.setDepartment(dto.getDepartment());
        if (dto.getInstitutionId() != null) user.setInstitutionId(dto.getInstitutionId());
        if (dto.getBio() != null) user.setBio(dto.getBio());

        user = userRepository.save(user);
        auditLogService.log(user.getId(), user.getUsername(), user.getRole().name(), "UPDATE_PROFILE", "User", "Updated user profile", null);
        return convertToDto(user);
    }

    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserProfileDto toggleUserStatus(Long userId, Long adminId, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setIsActive(!user.getIsActive());
        user = userRepository.save(user);

        auditLogService.log(adminId, adminUsername, "ADMIN", "TOGGLE_USER_STATUS", "User",
                "Changed active status of " + user.getUsername() + " to " + user.getIsActive(), null);

        return convertToDto(user);
    }

    @Transactional
    public UserProfileDto updateUserRole(Long userId, Role newRole, Long adminId, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Role oldRole = user.getRole();
        user.setRole(newRole);
        user = userRepository.save(user);

        auditLogService.log(adminId, adminUsername, "ADMIN", "CHANGE_USER_ROLE", "User",
                "Changed role of " + user.getUsername() + " from " + oldRole + " to " + newRole, null);

        return convertToDto(user);
    }

    public UserProfileDto convertToDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setStudentId(user.getStudentId());
        dto.setInstitutionId(user.getInstitutionId());
        dto.setDepartment(user.getDepartment());
        dto.setBio(user.getBio());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedDate(user.getCreatedDate());
        dto.setLastLogin(user.getLastLogin());
        return dto;
    }
}
