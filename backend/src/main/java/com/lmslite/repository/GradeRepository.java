package com.lmslite.repository;

import com.lmslite.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    List<Grade> findByCourseId(Long courseId);

    List<Grade> findByStudentId(Long studentId);

    List<Grade> findByStudentIdAndCourseId(Long studentId, Long courseId);

    Optional<Grade> findByStudentIdAndAssessmentId(Long studentId, Long assessmentId);

    @Query("SELECT AVG(g.points / g.maxPoints * 100) FROM Grade g WHERE g.student.id = :studentId")
    Double calculateOverallAverageForStudent(@Param("studentId") Long studentId);

    @Query("SELECT AVG(g.points / g.maxPoints * 100) FROM Grade g WHERE g.course.id = :courseId")
    Double calculateCourseAverage(@Param("courseId") Long courseId);
}
