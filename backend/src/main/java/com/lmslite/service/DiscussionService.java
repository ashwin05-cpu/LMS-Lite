package com.lmslite.service;

import com.lmslite.dto.DiscussionDto;
import com.lmslite.dto.DiscussionPostDto;
import com.lmslite.entity.*;
import com.lmslite.repository.CourseRepository;
import com.lmslite.repository.DiscussionPostRepository;
import com.lmslite.repository.DiscussionRepository;
import com.lmslite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiscussionService {

    @Autowired
    private DiscussionRepository discussionRepository;

    @Autowired
    private DiscussionPostRepository postRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<DiscussionDto> getCourseDiscussions(Long courseId) {
        return discussionRepository.findByCourseIdOrderByIsPinnedDescCreatedDateDesc(courseId).stream()
                .map(this::toDiscussionDto)
                .collect(Collectors.toList());
    }

    public DiscussionDto getDiscussionById(Long id) {
        Discussion d = discussionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discussion not found with id: " + id));
        return toDiscussionDto(d);
    }

    @Transactional
    public DiscussionDto createDiscussion(DiscussionDto dto, Long userId) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + dto.getCourseId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Discussion d = new Discussion();
        d.setCourse(course);
        d.setTitle(dto.getTitle());
        d.setDescription(dto.getDescription());
        d.setCategory(dto.getCategory() != null ? dto.getCategory() : "GENERAL");
        d.setCreatedBy(user);
        d.setIsPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false);
        d.setIsLocked(false);

        d = discussionRepository.save(d);
        return toDiscussionDto(d);
    }

    public List<DiscussionPostDto> getDiscussionPosts(Long discussionId) {
        return postRepository.findByDiscussionIdOrderByCreatedDateAsc(discussionId).stream()
                .map(this::toPostDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DiscussionPostDto addPost(Long discussionId, DiscussionPostDto dto, Long userId) {
        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new RuntimeException("Discussion not found with id: " + discussionId));

        if (Boolean.TRUE.equals(discussion.getIsLocked())) {
            throw new RuntimeException("Cannot post: This discussion topic has been locked");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        DiscussionPost post = new DiscussionPost();
        post.setDiscussion(discussion);
        post.setUser(user);
        post.setContent(dto.getContent());
        post.setParentPostId(dto.getParentPostId());

        post = postRepository.save(post);
        return toPostDto(post);
    }

    @Transactional
    public void toggleLock(Long discussionId) {
        Discussion d = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new RuntimeException("Discussion not found with id: " + discussionId));
        d.setIsLocked(!d.getIsLocked());
        discussionRepository.save(d);
    }

    @Transactional
    public void togglePin(Long discussionId) {
        Discussion d = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new RuntimeException("Discussion not found with id: " + discussionId));
        d.setIsPinned(!d.getIsPinned());
        discussionRepository.save(d);
    }

    @Transactional
    public void upvotePost(Long postId) {
        DiscussionPost p = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        p.setUpvotes(p.getUpvotes() + 1);
        postRepository.save(p);
    }

    public DiscussionDto toDiscussionDto(Discussion d) {
        DiscussionDto dto = new DiscussionDto();
        dto.setId(d.getId());
        dto.setCourseId(d.getCourse().getId());
        dto.setCourseTitle(d.getCourse().getTitle());
        dto.setTitle(d.getTitle());
        dto.setDescription(d.getDescription());
        dto.setCategory(d.getCategory());
        dto.setCreatedById(d.getCreatedBy().getId());
        dto.setCreatedByName(d.getCreatedBy().getFullName());
        dto.setCreatedByRole(d.getCreatedBy().getRole().name());
        dto.setCreatedDate(d.getCreatedDate());
        dto.setIsLocked(d.getIsLocked());
        dto.setIsPinned(d.getIsPinned());
        dto.setReplyCount(postRepository.countByDiscussionId(d.getId()));
        return dto;
    }

    public DiscussionPostDto toPostDto(DiscussionPost p) {
        DiscussionPostDto dto = new DiscussionPostDto();
        dto.setId(p.getId());
        dto.setDiscussionId(p.getDiscussion().getId());
        dto.setContent(p.getContent());
        dto.setParentPostId(p.getParentPostId());
        dto.setUserId(p.getUser().getId());
        dto.setUserName(p.getUser().getFullName());
        dto.setUserRole(p.getUser().getRole().name());
        dto.setCreatedDate(p.getCreatedDate());
        dto.setUpvotes(p.getUpvotes());
        return dto;
    }
}
