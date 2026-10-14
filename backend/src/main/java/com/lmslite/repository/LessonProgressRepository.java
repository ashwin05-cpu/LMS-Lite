package com.lmslite.repository;

import com.lmslite.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    Optional<LessonProgress> findByStudentIdAndContentId(Long studentId, Long contentId);

    @Query("SELECT lp FROM LessonProgress lp WHERE lp.student.id = :studentId AND lp.content.course.id = :courseId")
    List<LessonProgress> findByStudentIdAndCourseId(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.student.id = :studentId AND lp.content.course.id = :courseId AND lp.isCompleted = true")
    Long countCompletedLessons(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
}
