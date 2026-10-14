package com.lmslite.repository;

import com.lmslite.entity.AssessmentSubmission;
import com.lmslite.entity.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentSubmissionRepository extends JpaRepository<AssessmentSubmission, Long> {

    List<AssessmentSubmission> findByAssessmentId(Long assessmentId);

    List<AssessmentSubmission> findByStudentId(Long studentId);

    List<AssessmentSubmission> findByAssessmentIdAndStudentId(Long assessmentId, Long studentId);

    Optional<AssessmentSubmission> findTopByAssessmentIdAndStudentIdOrderByAttemptNumberDesc(Long assessmentId, Long studentId);

    @Query("SELECT s FROM AssessmentSubmission s WHERE s.assessment.course.id = :courseId ORDER BY s.submissionDate DESC")
    List<AssessmentSubmission> findByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT s FROM AssessmentSubmission s WHERE s.status = :status ORDER BY s.submissionDate DESC")
    List<AssessmentSubmission> findByStatus(@Param("status") SubmissionStatus status);

    @Query("SELECT COUNT(s) FROM AssessmentSubmission s WHERE s.assessment.course.instructor.id = :instructorId AND s.status = com.lmslite.entity.SubmissionStatus.SUBMITTED")
    Long countPendingGradingForInstructor(@Param("instructorId") Long instructorId);
}
