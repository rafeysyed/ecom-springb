package com.project.paymentservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payment_webhook_logs")
public class PaymentWebhookLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String provider; // STRIPE, RAZORPAY, SANDBOX_BANK

    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String payload;

    private String signature;

    @Column(nullable = false)
    private String status; // RECEIVED, PROCESSED, FAILED

    @Builder.Default
    private int retryCount = 0;

    private String failureMessage;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime processedAt;
}
