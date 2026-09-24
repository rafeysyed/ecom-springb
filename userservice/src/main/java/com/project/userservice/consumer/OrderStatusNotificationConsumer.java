package com.project.userservice.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.project.userservice.event.OrderStatusEvent;
import com.project.userservice.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OrderStatusNotificationConsumer {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public OrderStatusNotificationConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @KafkaListener(
            topics = "order-status-events",
            groupId = "${spring.kafka.consumer.group-id:user-notification-group}"
    )
    public void consume(String message) {
        log.info("Received raw OrderStatusEvent message: {}", message);
        try {
            OrderStatusEvent event = objectMapper.readValue(message, OrderStatusEvent.class);
            log.info("Parsed order status notification for order: {}, status: {}",
                    event.getOrderId(), event.getStatus());
            notificationService.createNotification(event);
        } catch (Exception e) {
            log.error("Failed to process order status notification event: {}", e.getMessage(), e);
        }
    }
}
