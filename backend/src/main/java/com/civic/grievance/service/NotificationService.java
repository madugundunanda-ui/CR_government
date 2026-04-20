package com.civic.grievance.service;

import com.civic.grievance.dto.NotificationResponse;
import com.civic.grievance.entity.Notification;
import com.civic.grievance.entity.User;
import com.civic.grievance.exception.ResourceNotFoundException;
import com.civic.grievance.repository.NotificationRepository;
import com.civic.grievance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyUser(User user, String title, String message, Long relatedComplaintId) {
        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .relatedComplaintId(relatedComplaintId)
                .read(false)
                .build();
        notificationRepository.save(n);
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_IdAndReadFalse(userId);
    }

    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (!n.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found for this user");
        }
        n.setRead(true);
        return mapToResponse(notificationRepository.save(n));
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUser_IdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .relatedComplaintId(n.getRelatedComplaintId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}