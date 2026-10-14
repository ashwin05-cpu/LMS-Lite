package com.lmslite.repository;

import com.lmslite.entity.Enrollment;
import com.lmslite.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudentId(Long studentId);

    List<Enrollment> findByCourseId(Long courseId);

    Optional<Enrollment> findByCourseIdAndStudentId(Long courseId, Long studentId);

    Boolean existsByCourseIdAndStudentId(Long courseId, Long studentId);

    Long countByCourseIdAndStatus(Long courseId, EnrollmentStatus status);

    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.status = :status")
    List<Enrollment> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") EnrollmentStatus status);
}
