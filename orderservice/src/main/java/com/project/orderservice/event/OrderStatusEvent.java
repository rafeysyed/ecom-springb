package com.project.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusEvent {
    private String orderId;
    private String userId;
    private String status;
    private String title;
    private String message;
    private String trackingUrl;
    private Instant timestamp;
}
