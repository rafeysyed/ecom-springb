package com.project.recommendationservice.controller;

import com.project.recommendationservice.dto.RecommendationResponseDTO;
import com.project.recommendationservice.dto.UserInteractionEvent;
import com.project.recommendationservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/for-you")
    public ResponseEntity<RecommendationResponseDTO> getRecommendationsForYou(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String paramUserId,
            @RequestParam(value = "limit", defaultValue = "8") int limit
    ) {
        String effectiveUserId = resolveUserId(headerUserId, paramUserId);
        UUID userUuid = (effectiveUserId != null && !effectiveUserId.isBlank())
                ? UUID.fromString(effectiveUserId)
                : null;

        RecommendationResponseDTO response = recommendationService.getPersonalizedRecommendations(userUuid, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/frequently-bought-together")
    public ResponseEntity<RecommendationResponseDTO> getFrequentlyBoughtTogether(
            @RequestParam("productId") UUID productId,
            @RequestParam(value = "limit", defaultValue = "3") int limit
    ) {
        RecommendationResponseDTO response = recommendationService.getFrequentlyBoughtTogether(productId, limit);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/interactions")
    public ResponseEntity<Void> recordInteraction(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody UserInteractionEvent event
    ) {
        if (event.getUserId() == null && headerUserId != null && !headerUserId.isBlank()) {
            event.setUserId(UUID.fromString(headerUserId));
        }

        if (event.getUserId() != null && event.getProductId() != null) {
            recommendationService.recordInteraction(event);
        }

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
