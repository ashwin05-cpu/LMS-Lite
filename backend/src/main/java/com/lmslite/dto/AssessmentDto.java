package com.lmslite.dto;

import com.lmslite.entity.AssessmentType;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class AssessmentDto {

    private Long id;
    private Long courseId;
    private String courseTitle;

    @NotBlank(message = "Assessment title is required")
    private String title;

    private String description;

    @NotNull(message = "Assessment type is required")
    private AssessmentType type = AssessmentType.QUIZ;

    @NotNull(message = "Total points are required")
    @Min(value = 1, message = "Total points must be at least 1")
    private Integer totalPoints = 100;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    private Integer timeLimit = 30; // minutes
    private Integer attempts = 1;
    private Integer passingScore = 60;
    private String questionsJson;
    private Boolean isSubmitted = false;
    private Double userScore;
    private Integer userAttempts = 0;
    private String userFeedback;

    public AssessmentDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public AssessmentType getType() { return type; }
    public void setType(AssessmentType type) { this.type = type; }

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }

    public Integer getAttempts() { return attempts; }
    public void setAttempts(Integer attempts) { this.attempts = attempts; }

    public Integer getPassingScore() { return passingScore; }
    public void setPassingScore(Integer passingScore) { this.passingScore = passingScore; }

    public String getQuestionsJson() { return questionsJson; }
    public void setQuestionsJson(String questionsJson) { this.questionsJson = questionsJson; }

    public Boolean getIsSubmitted() { return isSubmitted; }
    public void setIsSubmitted(Boolean isSubmitted) { this.isSubmitted = isSubmitted; }

    public Double getUserScore() { return userScore; }
    public void setUserScore(Double userScore) { this.userScore = userScore; }

    public Integer getUserAttempts() { return userAttempts; }
    public void setUserAttempts(Integer userAttempts) { this.userAttempts = userAttempts; }

    public String getUserFeedback() { return userFeedback; }
    public void setUserFeedback(String userFeedback) { this.userFeedback = userFeedback; }
}
