package com.lmslite.repository;

import com.lmslite.entity.DiscussionPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionPostRepository extends JpaRepository<DiscussionPost, Long> {

    List<DiscussionPost> findByDiscussionIdOrderByCreatedDateAsc(Long discussionId);

    List<DiscussionPost> findByDiscussionIdAndParentPostIdIsNullOrderByCreatedDateAsc(Long discussionId);

    List<DiscussionPost> findByParentPostIdOrderByCreatedDateAsc(Long parentPostId);

    Long countByDiscussionId(Long discussionId);
}
