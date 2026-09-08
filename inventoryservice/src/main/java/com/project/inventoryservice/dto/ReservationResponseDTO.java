package com.project.inventoryservice.dto;

import com.project.inventoryservice.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponseDTO {
    private UUID orderId;
    private Boolean success;
    private ReservationStatus status;
    private String message;
}
