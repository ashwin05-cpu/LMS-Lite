package com.lmslite.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class GradeDto {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;
    private String studentName;
    private String studentCode;

    @NotNull(message = "Course ID is required")
    private Long courseId;
    private String courseTitle;

    @NotNull(message = "Assessment ID is required")
    private Long assessmentId;
    private String assessmentTitle;

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score must be between 0-100")
    @Max(value = 100, message = "Score must be between 0-100")
    private Double points;

    private Double maxPoints = 100.0;
    private Long gradedById;
    private String gradedByName;
    private LocalDateTime gradedDate;
    private String feedback;
    private String letterGrade;

    public GradeDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }

    public Double getPoints() { return points; }
    public void setPoints(Double points) { this.points = points; }

    public Double getMaxPoints() { return maxPoints; }
    public void setMaxPoints(Double maxPoints) { this.maxPoints = maxPoints; }

    public Long getGradedById() { return gradedById; }
    public void setGradedById(Long gradedById) { this.gradedById = gradedById; }

    public String getGradedByName() { return gradedByName; }
    public void setGradedByName(String gradedByName) { this.gradedByName = gradedByName; }

    public LocalDateTime getGradedDate() { return gradedDate; }
    public void setGradedDate(LocalDateTime gradedDate) { this.gradedDate = gradedDate; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getLetterGrade() { return letterGrade; }
    public void setLetterGrade(String letterGrade) { this.letterGrade = letterGrade; }
}
