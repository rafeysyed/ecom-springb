package com.project.orderservice.event;

import lombok.Data;

@Data
public class PaymentCompletedEvent {

    private String paymentId;

    private String orderId;

    private String status;

}
