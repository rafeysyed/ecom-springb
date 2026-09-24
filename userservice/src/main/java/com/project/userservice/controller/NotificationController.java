package com.project.userservice.controller;

import com.project.userservice.dto.NotificationsResponseDTO;
import com.project.userservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/internal/users/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<NotificationsResponseDTO> getNotifications(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String paramUserId
    ) {
        String effectiveUserId = resolveUserId(headerUserId, paramUserId);
        if (effectiveUserId == null) {
            return ResponseEntity.badRequest().build();
        }

        NotificationsResponseDTO response = notificationService.getUserNotifications(UUID.fromString(effectiveUserId));
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String paramUserId
    ) {
        String effectiveUserId = resolveUserId(headerUserId, paramUserId);
        if (effectiveUserId == null) {
            return ResponseEntity.badRequest().build();
        }

        boolean updated = notificationService.markAsRead(UUID.fromString(effectiveUserId), id);
        if (!updated) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String paramUserId
    ) {
        String effectiveUserId = resolveUserId(headerUserId, paramUserId);
        if (effectiveUserId == null) {
            return ResponseEntity.badRequest().build();
        }

        notificationService.markAllAsRead(UUID.fromString(effectiveUserId));
        return ResponseEntity.ok().build();
    }

    private String resolveUserId(String headerUserId, String paramUserId) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId;
        }
        if (paramUserId != null && !paramUserId.isBlank()) {
            return paramUserId;
        }
        return null;
    }
}
