package com.project.orderservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Getter
@Setter
@Entity
public class ProcessedEvent {
    @Id
    private String eventId;

    private Instant processedAt;
}
