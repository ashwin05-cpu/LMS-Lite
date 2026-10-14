package com.lmslite.dto;

import com.lmslite.entity.SubmissionStatus;
import java.time.LocalDateTime;

public class SubmissionDto {

    private Long id;
    private Long assessmentId;
    private String assessmentTitle;
    private Long courseId;
    private String courseTitle;
    private Long studentId;
    private String studentName;
    private String studentCode;
    private LocalDateTime submissionDate;
    private Double score;
    private Integer attemptNumber = 1;
    private String answersJson;
    private String fileUrl;
    private String submissionText;
    private String feedback;
    private Long gradedById;
    private String gradedByName;
    private LocalDateTime gradedDate;
    private SubmissionStatus status;

    public SubmissionDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Integer getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(Integer attemptNumber) { this.attemptNumber = attemptNumber; }

    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getSubmissionText() { return submissionText; }
    public void setSubmissionText(String submissionText) { this.submissionText = submissionText; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Long getGradedById() { return gradedById; }
    public void setGradedById(Long gradedById) { this.gradedById = gradedById; }

    public String getGradedByName() { return gradedByName; }
    public void setGradedByName(String gradedByName) { this.gradedByName = gradedByName; }

    public LocalDateTime getGradedDate() { return gradedDate; }
    public void setGradedDate(LocalDateTime gradedDate) { this.gradedDate = gradedDate; }

    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }
}
