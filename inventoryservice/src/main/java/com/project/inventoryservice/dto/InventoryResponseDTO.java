package com.project.inventoryservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponseDTO {
    private UUID productId;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private Boolean inStock;
    private Boolean isLowStock;
}
