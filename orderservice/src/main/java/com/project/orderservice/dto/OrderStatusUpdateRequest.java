package com.project.orderservice.dto;

import com.project.orderservice.entity.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderStatusUpdateRequest {

    private OrderStatus status;
}
