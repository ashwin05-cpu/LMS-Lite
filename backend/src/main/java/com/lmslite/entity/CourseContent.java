package com.lmslite.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_content")
public class CourseContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "module_name", nullable = false, length = 100)
    private String moduleName;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 30)
    private ContentType contentType;

    @Column(name = "content_url", length = 500)
    private String contentUrl;

    @Lob
    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 15;

    @Column(name = "is_downloadable", nullable = false)
    private Boolean isDownloadable = true;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    public CourseContent() {}

    public CourseContent(Course course, String moduleName, String title,
                         ContentType contentType, String contentUrl, String textContent,
                         Integer orderIndex, Boolean isPublished, Integer durationMinutes,
                         Boolean isDownloadable) {
        this.course = course;
        this.moduleName = moduleName;
        this.title = title;
        this.contentType = contentType;
        this.contentUrl = contentUrl;
        this.textContent = textContent;
        this.orderIndex = orderIndex;
        this.isPublished = isPublished;
        this.durationMinutes = durationMinutes;
        this.isDownloadable = isDownloadable;
        this.createdDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getModuleName() { return moduleName; }
    public void setModuleName(String moduleName) { this.moduleName = moduleName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public ContentType getContentType() { return contentType; }
    public void setContentType(ContentType contentType) { this.contentType = contentType; }

    public String getContentUrl() { return contentUrl; }
    public void setContentUrl(String contentUrl) { this.contentUrl = contentUrl; }

    public String getTextContent() { return textContent; }
    public void setTextContent(String textContent) { this.textContent = textContent; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Boolean getIsDownloadable() { return isDownloadable; }
    public void setIsDownloadable(Boolean isDownloadable) { this.isDownloadable = isDownloadable; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
