package com.project.orderservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class OrderResponseDTO {

    private String orderId;

    private String userId;

    private BigDecimal totalAmount;

    private List<OrderItemDTO> items;
}
