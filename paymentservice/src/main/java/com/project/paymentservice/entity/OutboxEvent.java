package com.project.paymentservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "outbox_events")
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String payload;

    private boolean published;
}
