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
@Table(name = "refunds", indexes = {
    @Index(name = "idx_refund_order_id", columnList = "orderId"),
    @Index(name = "idx_refund_payment_id", columnList = "paymentId")
})
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String refundId;

    @Column(nullable = false)
    private String paymentId;

    @Column(nullable = false)
    private String orderId;

    private double amount;

    private String reason;

    @Column(nullable = false)
    private String status; // SUCCESS, FAILED

    private String refundReference;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
