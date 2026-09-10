package com.project.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {

    private String refundId;
    private String orderId;
    private String paymentId;
    private double amountRefunded;
    private double totalRefunded;
    private double remainingAmount;
    private String status; // SUCCESS, FAILED
    private String paymentStatus; // PARTIALLY_REFUNDED, FULLY_REFUNDED
    private String message;
}
