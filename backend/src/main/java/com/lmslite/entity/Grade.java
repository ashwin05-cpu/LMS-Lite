package com.lmslite.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "grades", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "assessment_id"})
})
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Column(nullable = false)
    private Double points;

    @Column(name = "max_points", nullable = false)
    private Double maxPoints = 100.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private User gradedBy;

    @Column(name = "graded_date", nullable = false)
    private LocalDateTime gradedDate = LocalDateTime.now();

    @Lob
    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "letter_grade", length = 5)
    private String letterGrade;

    public Grade() {}

    public Grade(User student, Course course, Assessment assessment, Double points,
                 Double maxPoints, User gradedBy, String feedback, String letterGrade) {
        this.student = student;
        this.course = course;
        this.assessment = assessment;
        this.points = points;
        this.maxPoints = maxPoints;
        this.gradedBy = gradedBy;
        this.feedback = feedback;
        this.letterGrade = letterGrade;
        this.gradedDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }

    public Double getPoints() { return points; }
    public void setPoints(Double points) { this.points = points; }

    public Double getMaxPoints() { return maxPoints; }
    public void setMaxPoints(Double maxPoints) { this.maxPoints = maxPoints; }

    public User getGradedBy() { return gradedBy; }
    public void setGradedBy(User gradedBy) { this.gradedBy = gradedBy; }

    public LocalDateTime getGradedDate() { return gradedDate; }
    public void setGradedDate(LocalDateTime gradedDate) { this.gradedDate = gradedDate; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getLetterGrade() { return letterGrade; }
    public void setLetterGrade(String letterGrade) { this.letterGrade = letterGrade; }
}
