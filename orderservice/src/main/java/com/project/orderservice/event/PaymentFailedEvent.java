package com.project.orderservice.event;

import lombok.Data;

import java.util.UUID;

@Data
public class PaymentFailedEvent {

    private String orderId;

    private String reason;
}
