package com.lmslite.repository;

import com.lmslite.entity.Course;
import com.lmslite.entity.CourseDifficulty;
import com.lmslite.entity.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findByCourseCode(String courseCode);

    Boolean existsByCourseCode(String courseCode);

    List<Course> findByStatus(CourseStatus status);

    List<Course> findByInstructorId(Long instructorId);

    @Query("SELECT c FROM Course c WHERE c.status = com.lmslite.entity.CourseStatus.PUBLISHED " +
           "AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.courseCode) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR c.category = :category) " +
           "AND (:difficulty IS NULL OR c.difficulty = :difficulty)")
    List<Course> searchCourses(@Param("search") String search,
                               @Param("category") String category,
                               @Param("difficulty") CourseDifficulty difficulty);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId AND e.status = com.lmslite.entity.EnrollmentStatus.ENROLLED")
    Long countEnrolledStudents(@Param("courseId") Long courseId);
}
