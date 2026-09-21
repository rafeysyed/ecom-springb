package com.project.orderservice.service;

import com.project.orderservice.client.InventoryClient;
import com.project.orderservice.client.PaymentClient;
import com.project.orderservice.client.ProductClient;
import com.project.orderservice.client.UserClient;
import com.project.orderservice.dto.OrderResponseDTO;
import com.project.orderservice.entity.Order;
import com.project.orderservice.entity.OrderStatus;
import com.project.orderservice.exception.ResourceNotFoundException;
import com.project.orderservice.producer.OrderEventProducer;
import com.project.orderservice.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderEventProducer orderEventProducer;

    @Mock
    private UserClient userClient;

    @Mock
    private ProductClient productClient;

    @Mock
    private InventoryClient inventoryClient;

    @Mock
    private PaymentClient paymentClient;

    @InjectMocks
    private OrderService orderService;

    private Order sampleOrder;
    private UUID sampleOrderId;
    private UUID sampleUserId;

    @BeforeEach
    void setUp() {
        sampleOrderId = UUID.randomUUID();
        sampleUserId = UUID.randomUUID();
        sampleOrder = Order.builder()
                .id(sampleOrderId)
                .userId(sampleUserId)
                .status(OrderStatus.CREATED)
                .totalAmount(BigDecimal.valueOf(250.00))
                .items(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("getOrder: should return mapped OrderResponseDTO when found")
    void getOrder_WhenExists_ShouldReturnOrderDTO() {
        when(orderRepository.findById(sampleOrderId)).thenReturn(Optional.of(sampleOrder));

        OrderResponseDTO response = orderService.getOrder(sampleOrderId);

        assertNotNull(response);
        assertEquals(sampleOrderId.toString(), response.getOrderId());
        assertEquals(OrderStatus.CREATED, response.getStatus());
        verify(orderRepository, times(1)).findById(sampleOrderId);
    }

    @Test
    @DisplayName("getOrder: should throw ResourceNotFoundException when order does not exist")
    void getOrder_WhenNotFound_ShouldThrowException() {
        UUID unknownId = UUID.randomUUID();
        when(orderRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrder(unknownId));
    }

    @Test
    @DisplayName("getOrdersByUserId: should return all orders belonging to user")
    void getOrdersByUserId_WhenFound_ShouldReturnList() {
        when(orderRepository.findByUserId(sampleUserId)).thenReturn(List.of(sampleOrder));

        List<OrderResponseDTO> orders = orderService.getOrdersByUserId(sampleUserId);

        assertNotNull(orders);
        assertEquals(1, orders.size());
        assertEquals(sampleOrderId.toString(), orders.get(0).getOrderId());
        verify(orderRepository, times(1)).findByUserId(sampleUserId);
    }

    @Test
    @DisplayName("getOrdersByUserId: should throw ResourceNotFoundException if user has no orders")
    void getOrdersByUserId_WhenEmpty_ShouldThrowException() {
        UUID emptyUserId = UUID.randomUUID();
        when(orderRepository.findByUserId(emptyUserId)).thenReturn(Collections.emptyList());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrdersByUserId(emptyUserId));
    }

    @Test
    @DisplayName("updateOrderStatus: should transition status to PAID upon payment success")
    void updateOrderStatus_WhenSuccess_ShouldUpdateToPaid() {
        when(orderRepository.findById(sampleOrderId)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        orderService.updateOrderStatus(sampleOrderId.toString(), "SUCCESS");

        assertEquals(OrderStatus.PAID, sampleOrder.getStatus());
        verify(orderRepository, times(1)).save(sampleOrder);
    }
}
