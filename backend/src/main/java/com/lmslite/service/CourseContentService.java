package com.lmslite.service;

import com.lmslite.dto.CourseContentDto;
import com.lmslite.entity.*;
import com.lmslite.repository.CourseContentRepository;
import com.lmslite.repository.CourseRepository;
import com.lmslite.repository.EnrollmentRepository;
import com.lmslite.repository.LessonProgressRepository;
import com.lmslite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseContentService {

    @Autowired
    private CourseContentRepository courseContentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CourseContentDto> getCourseContents(Long courseId, Long studentId) {
        List<CourseContent> contents = courseContentRepository.findByCourseIdOrderByOrderIndexAsc(courseId);

        return contents.stream().map(c -> {
            CourseContentDto dto = toDto(c);
            if (studentId != null) {
                lessonProgressRepository.findByStudentIdAndContentId(studentId, c.getId())
                        .ifPresent(lp -> dto.setIsCompleted(lp.getIsCompleted()));
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public CourseContentDto addContent(Long courseId, CourseContentDto dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        CourseContent content = new CourseContent();
        content.setCourse(course);
        content.setModuleName(dto.getModuleName());
        content.setTitle(dto.getTitle());
        content.setContentType(dto.getContentType());
        content.setContentUrl(dto.getContentUrl());
        content.setTextContent(dto.getTextContent());
        content.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 0);
        content.setIsPublished(dto.getIsPublished() != null ? dto.getIsPublished() : true);
        content.setDurationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 15);
        content.setIsDownloadable(dto.getIsDownloadable() != null ? dto.getIsDownloadable() : true);

        content = courseContentRepository.save(content);
        return toDto(content);
    }

    @Transactional
    public CourseContentDto updateContent(Long contentId, CourseContentDto dto) {
        CourseContent content = courseContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found with id: " + contentId));

        if (dto.getModuleName() != null) content.setModuleName(dto.getModuleName());
        if (dto.getTitle() != null) content.setTitle(dto.getTitle());
        if (dto.getContentType() != null) content.setContentType(dto.getContentType());
        if (dto.getContentUrl() != null) content.setContentUrl(dto.getContentUrl());
        if (dto.getTextContent() != null) content.setTextContent(dto.getTextContent());
        if (dto.getOrderIndex() != null) content.setOrderIndex(dto.getOrderIndex());
        if (dto.getIsPublished() != null) content.setIsPublished(dto.getIsPublished());
        if (dto.getDurationMinutes() != null) content.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getIsDownloadable() != null) content.setIsDownloadable(dto.getIsDownloadable());

        content = courseContentRepository.save(content);
        return toDto(content);
    }

    @Transactional
    public void deleteContent(Long contentId) {
        courseContentRepository.deleteById(contentId);
    }

    @Transactional
    public void toggleLessonCompletion(Long contentId, Long studentId) {
        CourseContent content = courseContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found with id: " + contentId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + studentId));

        Optional<LessonProgress> progressOpt = lessonProgressRepository.findByStudentIdAndContentId(studentId, contentId);
        LessonProgress progress;
        if (progressOpt.isPresent()) {
            progress = progressOpt.get();
            progress.setIsCompleted(!progress.getIsCompleted());
            progress.setCompletedAt(progress.getIsCompleted() ? LocalDateTime.now() : null);
        } else {
            progress = new LessonProgress(student, content, true);
        }
        lessonProgressRepository.save(progress);

        // Recalculate enrollment progress percent
        Long courseId = content.getCourse().getId();
        Long totalLessons = courseContentRepository.countByCourseIdAndIsPublishedTrue(courseId);
        Long completedLessons = lessonProgressRepository.countCompletedLessons(studentId, courseId);

        enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId).ifPresent(enrollment -> {
            if (totalLessons > 0) {
                int percent = (int) Math.min(100, Math.round((double) completedLessons / totalLessons * 100));
                enrollment.setProgressPercent(percent);
                if (percent == 100 && enrollment.getCompletionDate() == null) {
                    enrollment.setCompletionDate(LocalDateTime.now());
                    enrollment.setStatus(EnrollmentStatus.COMPLETED);
                }
                enrollmentRepository.save(enrollment);
            }
        });
    }

    private CourseContentDto toDto(CourseContent content) {
        CourseContentDto dto = new CourseContentDto();
        dto.setId(content.getId());
        dto.setCourseId(content.getCourse().getId());
        dto.setModuleName(content.getModuleName());
        dto.setTitle(content.getTitle());
        dto.setContentType(content.getContentType());
        dto.setContentUrl(content.getContentUrl());
        dto.setTextContent(content.getTextContent());
        dto.setOrderIndex(content.getOrderIndex());
        dto.setIsPublished(content.getIsPublished());
        dto.setDurationMinutes(content.getDurationMinutes());
        dto.setIsDownloadable(content.getIsDownloadable());
        return dto;
    }
}
