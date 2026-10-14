package com.lmslite.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", nullable = false, unique = true, length = 20)
    private String courseCode;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @Column(nullable = false)
    private Integer credits = 3;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "max_enrollment", nullable = false)
    private Integer maxEnrollment = 30;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CourseDifficulty difficulty = CourseDifficulty.BEGINNER;

    @Column(length = 100)
    private String category;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String syllabus;

    @Column(length = 255)
    private String prerequisites;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    public Course() {}

    public Course(String courseCode, String title, String description, User instructor,
                  Integer credits, LocalDate startDate, LocalDate endDate,
                  CourseStatus status, Integer maxEnrollment, CourseDifficulty difficulty,
                  String category, String syllabus, String prerequisites) {
        this.courseCode = courseCode;
        this.title = title;
        this.description = description;
        this.instructor = instructor;
        this.credits = credits;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.maxEnrollment = maxEnrollment;
        this.difficulty = difficulty;
        this.category = category;
        this.syllabus = syllabus;
        this.prerequisites = prerequisites;
        this.createdDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public User getInstructor() { return instructor; }
    public void setInstructor(User instructor) { this.instructor = instructor; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public CourseStatus getStatus() { return status; }
    public void setStatus(CourseStatus status) { this.status = status; }

    public Integer getMaxEnrollment() { return maxEnrollment; }
    public void setMaxEnrollment(Integer maxEnrollment) { this.maxEnrollment = maxEnrollment; }

    public CourseDifficulty getDifficulty() { return difficulty; }
    public void setDifficulty(CourseDifficulty difficulty) { this.difficulty = difficulty; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSyllabus() { return syllabus; }
    public void setSyllabus(String syllabus) { this.syllabus = syllabus; }

    public String getPrerequisites() { return prerequisites; }
    public void setPrerequisites(String prerequisites) { this.prerequisites = prerequisites; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
