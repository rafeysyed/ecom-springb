package com.project.orderservice.service;

import com.project.orderservice.client.InventoryClient;
import com.project.orderservice.client.ProductClient;
import com.project.orderservice.client.UserClient;
import com.project.orderservice.dto.OrderRequestDTO;
import com.project.orderservice.dto.OrderResponseDTO;
import com.project.orderservice.dto.ProductResponse;
import com.project.orderservice.dto.inventory.InventoryItemDTO;
import com.project.orderservice.dto.inventory.InventoryReservationRequest;
import com.project.orderservice.entity.Order;
import com.project.orderservice.entity.OrderItem;
import com.project.orderservice.entity.OrderStatus;
import com.project.orderservice.event.OrderCreatedEvent;
import com.project.orderservice.exception.InvalidOrderException;
import com.project.orderservice.exception.ResourceNotFoundException;
import com.project.orderservice.mapper.OrderMapper;
import com.project.orderservice.producer.OrderEventProducer;
import com.project.orderservice.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.weaver.ast.Or;
import org.jspecify.annotations.Nullable;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class OrderService {

    private OrderRepository orderRepository;
    private OrderEventProducer orderEventProducer;
    private final UserClient userClient;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;
    private final com.project.orderservice.client.PaymentClient paymentClient;
//    private final RestTemplate restTemplate;

    public OrderService(OrderRepository orderRepository, OrderEventProducer orderEventProducer,
                        UserClient userClient, ProductClient productClient,
                        InventoryClient inventoryClient,
                        com.project.orderservice.client.PaymentClient paymentClient){
        this.orderRepository = orderRepository;
        this.orderEventProducer = orderEventProducer;
        this.userClient = userClient;
        this.productClient = productClient;
        this.inventoryClient = inventoryClient;
        this.paymentClient = paymentClient;
    }

    @CircuitBreaker(name = "productService", fallbackMethod = "productFallback")
    public ProductResponse getProductWithCB(UUID productId){
        return productClient.getProduct(productId);
    }

    public ProductResponse productFallBack(UUID productId, Throwable ex){

        throw new RuntimeException("Product service unavailable for product: " + productId);
    }

    @CircuitBreaker(name = "userService", fallbackMethod = "userFallback")
    public void validateUser(UUID userId) {
        userClient.getUser(userId);
    }

    public void userFallback(UUID userId, Throwable ex) {
        throw new RuntimeException("User service unavailable for user: " + userId);
    }

//    public void validateUser(UUID userId){
//        userClient.getUser(userId);
//    }


    public OrderResponseDTO createOrder(OrderRequestDTO orderRequestDTO){

        validateUser(UUID.fromString(orderRequestDTO.getUserId()));

        if(orderRequestDTO.getItems() == null || orderRequestDTO.getItems().isEmpty()){
            throw new InvalidOrderException("Order must contain atleast one item");
        }

        Order order = OrderMapper.mapToEntity(orderRequestDTO);

//        order.setStatus(OrderStatus.CREATED);  //we already set this in entity class using prepersist annotation

        BigDecimal totalAmount = BigDecimal.ZERO;

        for(OrderItem item : order.getItems()){

//            try {
                ProductResponse product = getProductWithCB(item.getProductId());
//            }catch (Exception e){
//                throw new ProductNotFoundException("Product not found "+ item.getProductId());
//            }

            BigDecimal price = product.getPrice();
            item.setPrice(price);

            BigDecimal  itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

            totalAmount = totalAmount.add(itemTotal);
//            item.setOrder(order);  // already performed this operation in mapper class
        }
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Reserve inventory in inventory-service
        try {
            List<InventoryItemDTO> reservationItems = savedOrder.getItems().stream()
                    .map(i -> new InventoryItemDTO(i.getProductId(), i.getQuantity()))
                    .toList();
            inventoryClient.reserveStock(new InventoryReservationRequest(savedOrder.getId(), reservationItems));
            log.info("Successfully reserved inventory for order {}", savedOrder.getId());
        } catch (Exception e) {
            log.error("Failed to reserve inventory for order {}: {}", savedOrder.getId(), e.getMessage());
            savedOrder.setStatus(OrderStatus.FAILED);
            orderRepository.save(savedOrder);
            throw new RuntimeException("Could not place order: " + e.getMessage());
        }

        OrderCreatedEvent event = new OrderCreatedEvent(
                savedOrder.getId().toString(),
                savedOrder.getUserId().toString(),
                savedOrder.getStatus().name(),
                savedOrder.getTotalAmount().toString()
        );


        orderEventProducer.sendOrderCreatedEvent(event);

        return OrderMapper.mapToResponse(savedOrder);
    }

    public List<OrderResponseDTO> getAllOrders(){
        List<Order> orderList = orderRepository.findAll();
        List<OrderResponseDTO> responseList = new ArrayList<>();
        for(Order order : orderList){
            responseList.add(OrderMapper.mapToResponse(order));
        }
        return responseList;
    }

   public OrderResponseDTO getOrder(UUID id){
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return OrderMapper.mapToResponse(order);
    }

    public List<OrderResponseDTO> getOrdersByUserId(UUID userId){

        List<Order> orderList =  orderRepository.findByUserId(userId);

        if(orderList.isEmpty()){
            throw new ResourceNotFoundException("No orders found for this userId : "+userId);
        }

        List<OrderResponseDTO> responseList = new ArrayList<>();
        for(Order orders : orderList){
            responseList.add(OrderMapper.mapToResponse(orders));
        }
        return responseList;
    }

    public @Nullable OrderResponseDTO updateOrderStatus(UUID orderId, OrderStatus newStatus) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with this id : "+orderId));

        validateStatusTransition(order.getStatus(),newStatus);

        order.setStatus(newStatus);

        Order savedOrder = orderRepository.save(order);

        return OrderMapper.mapToResponse(savedOrder);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus newStatus) {

        if((current == OrderStatus.CREATED) && (newStatus == OrderStatus.PAID)){
            return;
        }

        if((current == OrderStatus.PAID)  && (newStatus == OrderStatus.SHIPPED)){
            return;
        }

        if((current == OrderStatus.SHIPPED) && (newStatus == OrderStatus.DELIVERED)){
            return;
        }

        if(((current == OrderStatus.CREATED) || (current == OrderStatus.PAYMENT_PENDING) || (current == OrderStatus.PAID))
                && (newStatus == OrderStatus.CANCELLED)){
            return;
        }

        throw new RuntimeException("Invalid status transition: "+current+" -> "+newStatus);
    }

    public void updateOrderStatus(String orderId, String status) {

        Order order = orderRepository.findById(UUID.fromString(orderId))
                .orElseThrow(() -> new RuntimeException("orderId not found: "+orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            log.info("Order {} is already CANCELLED, ignoring late payment update: {}", orderId, status);
            return;
        }

      switch (status.toUpperCase()){
          case "SUCCESS":
              order.setStatus(OrderStatus.PAID);
              try {
                  inventoryClient.commitReservation(UUID.fromString(orderId));
                  log.info("Committed inventory reservation for order {}", orderId);
              } catch (Exception e) {
                  log.error("Failed to commit inventory reservation for order {}: {}", orderId, e.getMessage());
              }
              break;
          case "FAILED":
              order.setStatus(OrderStatus.FAILED);
              try {
                  inventoryClient.releaseReservation(UUID.fromString(orderId));
                  log.info("Released inventory reservation for failed order {}", orderId);
              } catch (Exception e) {
                  log.error("Failed to release inventory reservation for order {}: {}", orderId, e.getMessage());
              }
              break;
          default:
              throw new RuntimeException("Unknown status"+status);
      }

        orderRepository.save(order);

        log.info("Order status updated to {}", status);
    }

    public OrderResponseDTO cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with this id : " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.FAILED) {
            return OrderMapper.mapToResponse(order);
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel an order that has already been shipped or delivered");
        }

        OrderStatus previousStatus = order.getStatus();
        validateStatusTransition(order.getStatus(), OrderStatus.CANCELLED);

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        // Restock inventory
        try {
            inventoryClient.releaseReservation(orderId);
            log.info("Released/Restocked inventory for cancelled order {}", orderId);
        } catch (Exception e) {
            log.error("Error communicating with inventory service during order cancellation for {}: {}", orderId, e.getMessage());
        }

        // Automated refund if order was already paid
        if (previousStatus == OrderStatus.PAID) {
            try {
                paymentClient.refundPayment(new com.project.orderservice.dto.payment.PaymentRefundRequest(orderId.toString(), null, "ORDER_CANCELLED_BY_CUSTOMER"));
                log.info("Triggered payment refund for cancelled order {}", orderId);
            } catch (Exception e) {
                log.error("Error communicating with payment service for refund on order {}: {}", orderId, e.getMessage());
            }
        }

        return OrderMapper.mapToResponse(savedOrder);
    }

    //RestTemplate is knowledge purpose, we use modern way(Feign Client) in our project
//    public void validateUser(UUID userId){
//
//        String url = "http://localhost:8082/users/" +userId;
//        try {
//            restTemplate.getForObject(url, Object.class);
//        }catch (Exception e){
//            throw new RuntimeException("user not found"+ userId);
//        }
//    }


}
