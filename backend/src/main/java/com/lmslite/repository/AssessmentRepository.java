package com.lmslite.repository;

import com.lmslite.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findByCourseIdOrderByDueDateAsc(Long courseId);

    Long countByCourseId(Long courseId);
}
