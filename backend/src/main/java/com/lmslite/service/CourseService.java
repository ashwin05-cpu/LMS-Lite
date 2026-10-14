package com.lmslite.service;

import com.lmslite.dto.CourseDto;
import com.lmslite.entity.*;
import com.lmslite.repository.CourseRepository;
import com.lmslite.repository.EnrollmentRepository;
import com.lmslite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<CourseDto> getPublicCourses(String search, String category, CourseDifficulty difficulty, Long currentUserId) {
        List<Course> courses = courseRepository.searchCourses(
                (search != null && !search.isBlank()) ? search.trim() : null,
                (category != null && !category.isBlank()) ? category.trim() : null,
                difficulty
        );

        return courses.stream().map(c -> toDto(c, currentUserId)).collect(Collectors.toList());
    }

    public List<CourseDto> getAllCourses(Long currentUserId) {
        return courseRepository.findAll().stream()
                .map(c -> toDto(c, currentUserId))
                .collect(Collectors.toList());
    }

    public List<CourseDto> getInstructorCourses(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId).stream()
                .map(c -> toDto(c, instructorId))
                .collect(Collectors.toList());
    }

    public CourseDto getCourseById(Long courseId, Long currentUserId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        return toDto(course, currentUserId);
    }

    @Transactional
    public CourseDto createCourse(CourseDto dto, Long instructorId) {
        // Validation: Unique course code (Appendix F & C)
        if (courseRepository.existsByCourseCode(dto.getCourseCode())) {
            throw new RuntimeException("Course code already exists: " + dto.getCourseCode());
        }

        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));

        Course course = new Course();
        course.setCourseCode(dto.getCourseCode());
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        course.setInstructor(instructor);
        course.setCredits(dto.getCredits() != null ? dto.getCredits() : 3);
        course.setStartDate(dto.getStartDate());
        course.setEndDate(dto.getEndDate());
        course.setStatus(dto.getStatus() != null ? dto.getStatus() : CourseStatus.DRAFT);
        course.setMaxEnrollment(dto.getMaxEnrollment() != null ? dto.getMaxEnrollment() : 30);
        course.setDifficulty(dto.getDifficulty() != null ? dto.getDifficulty() : CourseDifficulty.BEGINNER);
        course.setCategory(dto.getCategory());
        course.setSyllabus(dto.getSyllabus());
        course.setPrerequisites(dto.getPrerequisites());

        course = courseRepository.save(course);

        auditLogService.log(instructor.getId(), instructor.getUsername(), instructor.getRole().name(),
                "CREATE_COURSE", "Course", "Created course " + course.getCourseCode(), null);

        return toDto(course, instructorId);
    }

    @Transactional
    public CourseDto updateCourse(Long courseId, CourseDto dto, Long currentUserId, boolean isAdmin) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Business Rule: Instructors can only modify their own courses (Appendix F)
        if (!isAdmin && (course.getInstructor() == null || !course.getInstructor().getId().equals(currentUserId))) {
            throw new RuntimeException("You do not have permission to modify this course");
        }

        // Business Rule: Course capacity cannot be reduced below current enrollment (Appendix F)
        Long currentEnrollment = courseRepository.countEnrolledStudents(courseId);
        if (dto.getMaxEnrollment() != null && dto.getMaxEnrollment() < currentEnrollment) {
            throw new RuntimeException("Capacity cannot be reduced below current enrollment (" + currentEnrollment + " students)");
        }

        if (dto.getTitle() != null) course.setTitle(dto.getTitle());
        if (dto.getDescription() != null) course.setDescription(dto.getDescription());
        if (dto.getCredits() != null) course.setCredits(dto.getCredits());
        if (dto.getStartDate() != null) course.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) course.setEndDate(dto.getEndDate());
        if (dto.getStatus() != null) course.setStatus(dto.getStatus());
        if (dto.getMaxEnrollment() != null) course.setMaxEnrollment(dto.getMaxEnrollment());
        if (dto.getDifficulty() != null) course.setDifficulty(dto.getDifficulty());
        if (dto.getCategory() != null) course.setCategory(dto.getCategory());
        if (dto.getSyllabus() != null) course.setSyllabus(dto.getSyllabus());
        if (dto.getPrerequisites() != null) course.setPrerequisites(dto.getPrerequisites());

        course = courseRepository.save(course);
        return toDto(course, currentUserId);
    }

    @Transactional
    public void deleteOrArchiveCourse(Long courseId, Long currentUserId, boolean isAdmin) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (!isAdmin && (course.getInstructor() == null || !course.getInstructor().getId().equals(currentUserId))) {
            throw new RuntimeException("You do not have permission to delete this course");
        }

        // Business Rule: Courses cannot be deleted after students enroll (Appendix F)
        Long enrolledCount = courseRepository.countEnrolledStudents(courseId);
        if (enrolledCount > 0) {
            // Cannot delete, archive instead per business rules
            course.setStatus(CourseStatus.ARCHIVED);
            courseRepository.save(course);
            return;
        }

        courseRepository.delete(course);
    }

    public CourseDto toDto(Course course, Long currentUserId) {
        CourseDto dto = new CourseDto();
        dto.setId(course.getId());
        dto.setCourseCode(course.getCourseCode());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setCredits(course.getCredits());
        dto.setStartDate(course.getStartDate());
        dto.setEndDate(course.getEndDate());
        dto.setStatus(course.getStatus());
        dto.setMaxEnrollment(course.getMaxEnrollment());
        dto.setDifficulty(course.getDifficulty());
        dto.setCategory(course.getCategory());
        dto.setSyllabus(course.getSyllabus());
        dto.setPrerequisites(course.getPrerequisites());

        if (course.getInstructor() != null) {
            dto.setInstructorId(course.getInstructor().getId());
            dto.setInstructorName(course.getInstructor().getFullName());
        }

        Long enrolledCount = courseRepository.countEnrolledStudents(course.getId());
        dto.setEnrolledCount(enrolledCount);

        if (currentUserId != null) {
            enrollmentRepository.findByCourseIdAndStudentId(course.getId(), currentUserId).ifPresent(enrollment -> {
                dto.setIsEnrolled(enrollment.getStatus() == EnrollmentStatus.ENROLLED || enrollment.getStatus() == EnrollmentStatus.COMPLETED);
                dto.setUserProgress(enrollment.getProgressPercent());
            });
        }

        return dto;
    }
}
