package com.project.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentProcessResponse {

    private String paymentId;
    private String orderId;
    private String status; // SUCCESS, FAILED, REQUIRES_ACTION, TIMED_OUT, CANCELLED
    private String transactionReference;
    private double amount;
    private String currency;
    private String paymentMethod;
    private String failureReason;
    private String failureCode;
    private String message;

    // 3D Secure challenge fields
    private boolean otpChallengeRequired;
    private String challengeId;
}
