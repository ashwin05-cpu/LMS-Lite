package com.lmslite.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "content_id"})
})
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private CourseContent content;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public LessonProgress() {}

    public LessonProgress(User student, CourseContent content, Boolean isCompleted) {
        this.student = student;
        this.content = content;
        this.isCompleted = isCompleted;
        this.completedAt = isCompleted ? LocalDateTime.now() : null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public CourseContent getContent() { return content; }
    public void setContent(CourseContent content) { this.content = content; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
        this.completedAt = isCompleted ? LocalDateTime.now() : null;
    }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
