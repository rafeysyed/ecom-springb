package com.project.userservice.event;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderStatusEvent {
    private String orderId;
    private String userId;
    private String status;
    private String title;
    private String message;
    private String trackingUrl;
    private Instant timestamp;
}
