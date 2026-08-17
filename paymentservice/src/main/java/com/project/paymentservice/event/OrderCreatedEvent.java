package com.project.paymentservice.event;

import lombok.Data;


@Data
public class OrderCreatedEvent {

    private String orderId;
    private String userId;
    private String totalAmount;
    private String status;

    public OrderCreatedEvent(){   }

    public OrderCreatedEvent(String orderId, String userId, String status, String totalAmount) {
        this.orderId = orderId;
        this.userId = userId;
        this.status = status;
        this.totalAmount = totalAmount;
    }
}
