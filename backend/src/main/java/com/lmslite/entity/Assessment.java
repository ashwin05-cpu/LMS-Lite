package com.lmslite.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessments")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssessmentType type = AssessmentType.QUIZ;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 100;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "time_limit")
    private Integer timeLimit = 30; // in minutes

    @Column(name = "attempts", nullable = false)
    private Integer attempts = 1;

    @Column(name = "passing_score")
    private Integer passingScore = 60;

    @Lob
    @Column(name = "questions_json", columnDefinition = "TEXT")
    private String questionsJson;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    public Assessment() {}

    public Assessment(Course course, String title, String description, AssessmentType type,
                      Integer totalPoints, LocalDateTime dueDate, Integer timeLimit,
                      Integer attempts, Integer passingScore, String questionsJson) {
        this.course = course;
        this.title = title;
        this.description = description;
        this.type = type;
        this.totalPoints = totalPoints;
        this.dueDate = dueDate;
        this.timeLimit = timeLimit;
        this.attempts = attempts;
        this.passingScore = passingScore;
        this.questionsJson = questionsJson;
        this.createdDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

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

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
