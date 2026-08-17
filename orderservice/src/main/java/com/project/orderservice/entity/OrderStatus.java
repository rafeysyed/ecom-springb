package com.project.orderservice.entity;

public enum OrderStatus {

    CREATED,
    PAYMENT_PENDING,
    PAYMENT_COMPLETED,
    PAID,
    FAILED,
    CANCELLED,
    SHIPPED,
    DELIVERED
}
