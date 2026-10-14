package com.lmslite.dto;

import com.lmslite.entity.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CourseContentDto {

    private Long id;
    private Long courseId;

    @NotBlank(message = "Module name is required")
    private String moduleName;

    @NotBlank(message = "Content title is required")
    private String title;

    @NotNull(message = "Content type is required")
    private ContentType contentType;

    private String contentUrl;
    private String textContent;
    private Integer orderIndex = 0;
    private Boolean isPublished = true;
    private Integer durationMinutes = 15;
    private Boolean isDownloadable = true;
    private Boolean isCompleted = false;

    public CourseContentDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

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

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }
}
