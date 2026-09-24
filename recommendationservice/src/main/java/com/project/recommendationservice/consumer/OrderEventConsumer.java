package com.project.recommendationservice.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.recommendationservice.dto.UserInteractionEvent;
import com.project.recommendationservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final RecommendationService recommendationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(
            topics = "order-status-events",
            groupId = "${spring.kafka.consumer.group-id:recommendation-group}"
    )
    public void consumeOrderStatus(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String status = root.path("status").asText();
            String userIdStr = root.path("userId").asText();

            if ("PAID".equalsIgnoreCase(status) && userIdStr != null && !userIdStr.isBlank()) {
                UUID userId = UUID.fromString(userIdStr);
                log.info("Received PAID order event for recommendation learning: userId={}", userId);

                // If event contains orderId or items, we can register them.
                // At minimum, we trigger catalog refresh / history update
                recommendationService.refreshCatalogIndex();
            }
        } catch (Exception e) {
            log.error("Failed to process order status event in recommendationservice: {}", e.getMessage());
        }
    }
}
