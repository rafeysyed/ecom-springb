package com.project.orderservice.mapper;

import com.project.orderservice.dto.OrderItemDTO;
import com.project.orderservice.dto.OrderRequestDTO;
import com.project.orderservice.dto.OrderResponseDTO;
import com.project.orderservice.entity.Order;
import com.project.orderservice.entity.OrderItem;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class OrderMapper {

    public static Order mapToEntity(OrderRequestDTO dto){

        Order order = new Order();
        order.setUserId(UUID.fromString(dto.getUserId()));

        List<OrderItem> items = new ArrayList<>();

        for(OrderItemDTO itemDto : dto.getItems()){
            OrderItem item = new OrderItem();
//            item.setPrice(itemDto.getPrice());
            item.setQuantity(itemDto.getQuantity());
            item.setProductId(UUID.fromString(itemDto.getProductId()));

            item.setOrder(order); // important for relationship

            items.add(item);
        }
        order.setItems(items);

        return order;
    }

    public static OrderResponseDTO mapToResponse(Order order){

        OrderResponseDTO responseDTO = new OrderResponseDTO();
        responseDTO.setTotalAmount(order.getTotalAmount());
        responseDTO.setUserId(order.getUserId().toString());
        responseDTO.setOrderId(order.getId().toString());
        responseDTO.setStatus(order.getStatus());
        responseDTO.setCreatedAt(order.getCreatedAt());

        List<OrderItemDTO> orderItemDTOList =  new ArrayList<>();

        for(OrderItem item : order.getItems()){

            OrderItemDTO orderItemDTO = new OrderItemDTO();
            orderItemDTO.setPrice(item.getPrice());
            orderItemDTO.setQuantity(item.getQuantity());
            orderItemDTO.setProductId(item.getProductId().toString());
            orderItemDTOList.add(orderItemDTO);
        }

        responseDTO.setItems(orderItemDTOList);
        return responseDTO;
    }

}
