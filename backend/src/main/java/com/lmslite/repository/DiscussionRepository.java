package com.lmslite.repository;

import com.lmslite.entity.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, Long> {

    List<Discussion> findByCourseIdOrderByIsPinnedDescCreatedDateDesc(Long courseId);

    List<Discussion> findByCourseIdAndCategoryOrderByCreatedDateDesc(Long courseId, String category);
}
