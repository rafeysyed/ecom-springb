package com.project.paymentservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name="payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String paymentId;

    private String orderId;

    private String userId;

    private double  amount;

    private String status;
}
