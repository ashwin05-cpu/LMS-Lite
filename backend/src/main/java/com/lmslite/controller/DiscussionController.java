package com.lmslite.controller;

import com.lmslite.dto.ApiResponse;
import com.lmslite.dto.DiscussionDto;
import com.lmslite.dto.DiscussionPostDto;
import com.lmslite.security.UserDetailsImpl;
import com.lmslite.service.DiscussionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discussions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DiscussionController {

    @Autowired
    private DiscussionService discussionService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseDiscussions(@PathVariable Long courseId) {
        List<DiscussionDto> list = discussionService.getCourseDiscussions(courseId);
        return ResponseEntity.ok(ApiResponse.success("Discussions fetched", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDiscussionById(@PathVariable Long id) {
        DiscussionDto dto = discussionService.getDiscussionById(id);
        return ResponseEntity.ok(ApiResponse.success("Discussion fetched", dto));
    }

    @PostMapping
    public ResponseEntity<?> createDiscussion(
            @Valid @RequestBody DiscussionDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            DiscussionDto created = discussionService.createDiscussion(dto, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Discussion created", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<?> getDiscussionPosts(@PathVariable Long id) {
        List<DiscussionPostDto> posts = discussionService.getDiscussionPosts(id);
        return ResponseEntity.ok(ApiResponse.success("Posts fetched", posts));
    }

    @PostMapping("/{id}/posts")
    public ResponseEntity<?> addPost(
            @PathVariable Long id,
            @Valid @RequestBody DiscussionPostDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            DiscussionPostDto created = discussionService.addPost(id, dto, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Reply posted", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> toggleLock(@PathVariable Long id) {
        discussionService.toggleLock(id);
        return ResponseEntity.ok(ApiResponse.success("Discussion lock status toggled"));
    }

    @PostMapping("/{id}/pin")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'TEACHING_ASSISTANT', 'ADMIN')")
    public ResponseEntity<?> togglePin(@PathVariable Long id) {
        discussionService.togglePin(id);
        return ResponseEntity.ok(ApiResponse.success("Discussion pin status toggled"));
    }

    @PostMapping("/posts/{postId}/upvote")
    public ResponseEntity<?> upvotePost(@PathVariable Long postId) {
        discussionService.upvotePost(postId);
        return ResponseEntity.ok(ApiResponse.success("Post upvoted"));
    }
}
