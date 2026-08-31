package com.project.orderservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderItemDTO {

    private String productId;

    private BigDecimal price;

    private Integer quantity;
}
