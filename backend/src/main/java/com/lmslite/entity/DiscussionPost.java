package com.lmslite.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discussion_posts")
public class DiscussionPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_id", nullable = false)
    private Discussion discussion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "parent_post_id")
    private Long parentPostId;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(nullable = false)
    private Integer upvotes = 0;

    public DiscussionPost() {}

    public DiscussionPost(Discussion discussion, User user, String content, Long parentPostId) {
        this.discussion = discussion;
        this.user = user;
        this.content = content;
        this.parentPostId = parentPostId;
        this.createdDate = LocalDateTime.now();
        this.upvotes = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Discussion getDiscussion() { return discussion; }
    public void setDiscussion(Discussion discussion) { this.discussion = discussion; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getParentPostId() { return parentPostId; }
    public void setParentPostId(Long parentPostId) { this.parentPostId = parentPostId; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }
}
