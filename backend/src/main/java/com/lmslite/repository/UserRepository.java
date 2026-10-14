package com.lmslite.repository;

import com.lmslite.entity.Role;
import com.lmslite.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByStudentId(String studentId);

    // Multi-credential lookup (username, email, or student_id)
    @Query("SELECT u FROM User u WHERE u.username = :credential OR u.email = :credential OR u.studentId = :credential")
    Optional<User> findByAnyCredential(@Param("credential") String credential);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Boolean existsByStudentId(String studentId);

    List<User> findByRole(Role role);

    List<User> findByIsActive(Boolean isActive);
}
