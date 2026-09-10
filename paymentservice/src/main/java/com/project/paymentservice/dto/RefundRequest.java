package com.project.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequest {

    private String orderId;
    private Double amount; // Null for full refund, or specified amount for partial refund
    private String reason; // e.g. "CUSTOMER_CANCELLATION", "ITEM_OUT_OF_STOCK"
}
