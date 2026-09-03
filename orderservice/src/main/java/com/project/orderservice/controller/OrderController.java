package com.project.orderservice.controller;

import com.project.orderservice.dto.OrderRequestDTO;
import com.project.orderservice.dto.OrderResponseDTO;
import com.project.orderservice.dto.OrderStatusUpdateRequest;
import com.project.orderservice.entity.Order;
import com.project.orderservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private OrderService orderService;

    public OrderController(OrderService orderService){
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@RequestBody OrderRequestDTO requestDTO){
        OrderResponseDTO savedOrder = orderService.createOrder(requestDTO);
       return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders(){
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable UUID id){

        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUserId(@PathVariable UUID userId){

        List<OrderResponseDTO> responseList = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(responseList);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable UUID orderId, @RequestBody OrderStatusUpdateRequest request){

        OrderResponseDTO response =
                orderService.updateOrderStatus(orderId,request.getStatus());
        return ResponseEntity.ok(response);
    }

}
