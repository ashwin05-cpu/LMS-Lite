package com.lmslite.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_submissions")
public class AssessmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate = LocalDateTime.now();

    @Column
    private Double score;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber = 1;

    @Lob
    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Lob
    @Column(name = "submission_text", columnDefinition = "TEXT")
    private String submissionText;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String feedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private User gradedBy;

    @Column(name = "graded_date")
    private LocalDateTime gradedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;

    public AssessmentSubmission() {}

    public AssessmentSubmission(Assessment assessment, User student, Integer attemptNumber,
                                String answersJson, String fileUrl, String submissionText) {
        this.assessment = assessment;
        this.student = student;
        this.attemptNumber = attemptNumber;
        this.answersJson = answersJson;
        this.fileUrl = fileUrl;
        this.submissionText = submissionText;
        this.submissionDate = LocalDateTime.now();
        this.status = SubmissionStatus.SUBMITTED;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

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

    public User getGradedBy() { return gradedBy; }
    public void setGradedBy(User gradedBy) { this.gradedBy = gradedBy; }

    public LocalDateTime getGradedDate() { return gradedDate; }
    public void setGradedDate(LocalDateTime gradedDate) { this.gradedDate = gradedDate; }

    public SubmissionStatus getStatus() { return status; }
    public void setStatus(SubmissionStatus status) { this.status = status; }
}
