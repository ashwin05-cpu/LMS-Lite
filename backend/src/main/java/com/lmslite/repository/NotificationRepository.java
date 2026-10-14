package com.lmslite.repository;

import com.lmslite.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedDateDesc(Long userId);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedDateDesc(Long userId);

    Long countByUserIdAndIsReadFalse(Long userId);
}
