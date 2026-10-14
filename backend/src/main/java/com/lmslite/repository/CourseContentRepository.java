package com.lmslite.repository;

import com.lmslite.entity.CourseContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseContentRepository extends JpaRepository<CourseContent, Long> {

    List<CourseContent> findByCourseIdOrderByOrderIndexAsc(Long courseId);

    List<CourseContent> findByCourseIdAndIsPublishedTrueOrderByOrderIndexAsc(Long courseId);

    Long countByCourseIdAndIsPublishedTrue(Long courseId);
}
