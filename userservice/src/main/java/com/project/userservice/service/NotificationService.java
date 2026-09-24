package com.project.userservice.service;

import com.project.userservice.dto.NotificationDTO;
import com.project.userservice.dto.NotificationsResponseDTO;
import com.project.userservice.entity.Notification;
import com.project.userservice.entity.User;
import com.project.userservice.event.OrderStatusEvent;
import com.project.userservice.repository.NotificationRepository;
import com.project.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public NotificationDTO createNotification(OrderStatusEvent event) {
        log.info("Processing notification for user: {}, order: {}, status: {}",
                event.getUserId(), event.getOrderId(), event.getStatus());

        UUID userId = UUID.fromString(event.getUserId());
        UUID orderId = event.getOrderId() != null ? UUID.fromString(event.getOrderId()) : null;

        Notification notification = Notification.builder()
                .userId(userId)
                .orderId(orderId)
                .title(event.getTitle())
                .message(event.getMessage())
                .link(event.getTrackingUrl())
                .status(event.getStatus())
                .isRead(false)
                .createdAt(event.getTimestamp() != null ? event.getTimestamp() : Instant.now())
                .build();

        Notification saved = notificationRepository.save(notification);

        // Dispatch Email asynchronously/safely
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            userOptional.ifPresent(user -> emailService.sendOrderStatusEmail(
                    user.getEmail(),
                    event.getOrderId(),
                    event.getStatus(),
                    event.getTitle(),
                    event.getMessage(),
                    event.getTrackingUrl()
            ));
        } catch (Exception ex) {
            log.error("Failed to trigger email for notification {}: {}", saved.getId(), ex.getMessage());
        }

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public NotificationsResponseDTO getUserNotifications(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);

        List<NotificationDTO> dtoList = notifications.stream()
                .map(this::mapToDTO)
                .toList();

        return NotificationsResponseDTO.builder()
                .notifications(dtoList)
                .unreadCount(unreadCount)
                .build();
    }

    @Transactional
    public boolean markAsRead(UUID userId, UUID notificationId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            if (notification.getUserId().equals(userId)) {
                notification.setRead(true);
                notificationRepository.save(notification);
                return true;
            }
        }
        return false;
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    private NotificationDTO mapToDTO(Notification entity) {
        return NotificationDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .orderId(entity.getOrderId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .link(entity.getLink())
                .status(entity.getStatus())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
