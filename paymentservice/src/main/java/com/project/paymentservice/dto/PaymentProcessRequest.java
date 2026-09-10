package com.project.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentProcessRequest {

    private String orderId;
    private String userId;
    private double amount;
    private String currency; // Default USD
    private String paymentMethod; // CARD, UPI, COD, NET_BANKING

    // Card details (if method = CARD)
    private String cardNumber;
    private String cardExpiry;
    private String cvv;
    private String cardHolderName;

    // UPI details (if method = UPI)
    private String vpa; // e.g. success@upi, fail@upi

    // Idempotency
    private String idempotencyKey;
}
