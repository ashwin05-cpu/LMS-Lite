package com.lmslite.dto;

import com.lmslite.entity.CourseDifficulty;
import com.lmslite.entity.CourseStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class CourseDto {

    private Long id;

    @NotBlank(message = "Course code is required")
    @Pattern(regexp = "^[a-zA-Z0-9-_ ]{3,20}$", message = "Course code must be 3 to 20 alphanumeric characters or hyphens (e.g. CS-101, CS101)")
    private String courseCode;

    @NotBlank(message = "Course title is required")
    @Size(min = 5, max = 200, message = "Course title must be between 5 and 200 characters")
    private String title;

    private String description;

    @NotNull(message = "Credits are required")
    @Min(value = 1, message = "Credits must be between 1-6")
    @Max(value = 6, message = "Credits must be between 1-6")
    private Integer credits = 3;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private CourseStatus status = CourseStatus.DRAFT;

    @NotNull(message = "Max enrollment is required")
    @Min(value = 1, message = "Max enrollment must be at least 1")
    private Integer maxEnrollment = 30;

    private CourseDifficulty difficulty = CourseDifficulty.BEGINNER;

    private String category;

    private String syllabus;

    private String prerequisites;

    private Long instructorId;

    private String instructorName;

    private Long enrolledCount = 0L;

    private Boolean isEnrolled = false;

    private Integer userProgress = 0;

    public CourseDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode != null ? courseCode.trim().toUpperCase() : null;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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

    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }

    public String getInstructorName() { return instructorName; }
    public void setInstructorName(String instructorName) { this.instructorName = instructorName; }

    public Long getEnrolledCount() { return enrolledCount; }
    public void setEnrolledCount(Long enrolledCount) { this.enrolledCount = enrolledCount; }

    public Boolean getIsEnrolled() { return isEnrolled; }
    public void setIsEnrolled(Boolean isEnrolled) { this.isEnrolled = isEnrolled; }

    public Integer getUserProgress() { return userProgress; }
    public void setUserProgress(Integer userProgress) { this.userProgress = userProgress; }
}
