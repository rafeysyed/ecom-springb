package com.project.paymentservice.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResult {

    private boolean success;
    private String status; // SUCCESS, FAILED, REQUIRES_ACTION, TIMED_OUT, CANCELLED
    private String transactionReference;
    private String failureReason;
    private String failureCode;
    private String message;
    private boolean otpChallengeRequired;
    private String challengeId;
    private String cardLast4;
    private String cardBrand;

    public static PaymentResult success(String txRef, String last4, String brand) {
        return PaymentResult.builder()
                .success(true)
                .status("SUCCESS")
                .transactionReference(txRef)
                .cardLast4(last4)
                .cardBrand(brand)
                .message("Payment processed successfully")
                .build();
    }

    public static PaymentResult failed(String reason, String code, String message, String last4, String brand) {
        return PaymentResult.builder()
                .success(false)
                .status("FAILED")
                .failureReason(reason)
                .failureCode(code)
                .message(message)
                .cardLast4(last4)
                .cardBrand(brand)
                .build();
    }

    public static PaymentResult requiresAction(String challengeId, String last4, String brand) {
        return PaymentResult.builder()
                .success(false)
                .status("REQUIRES_ACTION")
                .otpChallengeRequired(true)
                .challengeId(challengeId)
                .cardLast4(last4)
                .cardBrand(brand)
                .message("3D Secure OTP authentication required")
                .build();
    }

    public static PaymentResult timedOut(String message) {
        return PaymentResult.builder()
                .success(false)
                .status("TIMED_OUT")
                .failureReason("PAYMENT_TIMEOUT")
                .failureCode("TIMEOUT_408")
                .message(message)
                .build();
    }
}
