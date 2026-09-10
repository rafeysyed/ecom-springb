package com.project.paymentservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payments", indexes = {
    @Index(name = "idx_payment_order_id", columnList = "orderId"),
    @Index(name = "idx_payment_idempotency_key", columnList = "idempotencyKey")
})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String paymentId;

    @Column(nullable = false)
    private String orderId;

    private String userId;

    private double amount;

    @Builder.Default
    private double amountRefunded = 0.0;

    @Builder.Default
    private String currency = "USD";

    @Builder.Default
    private String paymentMethod = "CARD"; // CARD, UPI, COD, NET_BANKING

    @Column(nullable = false)
    private String status; // PENDING, REQUIRES_ACTION, SUCCESS, FAILED, CANCELLED, TIMED_OUT, PARTIALLY_REFUNDED, FULLY_REFUNDED

    private String transactionReference;

    @Column(unique = true)
    private String idempotencyKey;

    private String failureReason; // INSUFFICIENT_FUNDS, CARD_DECLINED, AUTHENTICATION_FAILED, PAYMENT_TIMEOUT, NETWORK_FAILURE, USER_CANCELLED

    private String failureCode;

    private String cardLast4;

    private String cardBrand;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
