package com.lmslite.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class DiscussionPostDto {

    private Long id;

    @NotNull(message = "Discussion ID is required")
    private Long discussionId;

    @NotBlank(message = "Content cannot be empty")
    private String content;

    private Long parentPostId;
    private Long userId;
    private String userName;
    private String userRole;
    private LocalDateTime createdDate;
    private Integer upvotes = 0;

    public DiscussionPostDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDiscussionId() { return discussionId; }
    public void setDiscussionId(Long discussionId) { this.discussionId = discussionId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getParentPostId() { return parentPostId; }
    public void setParentPostId(Long parentPostId) { this.parentPostId = parentPostId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }
}
