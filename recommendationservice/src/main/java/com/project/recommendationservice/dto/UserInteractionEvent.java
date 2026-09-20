package com.project.recommendationservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserInteractionEvent implements Serializable {
    private UUID userId;
    private UUID productId;
    private String eventType; // VIEW, CART_ADD, PURCHASE
    private Instant timestamp;
}
