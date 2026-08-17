package com.project.orderservice.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.orderservice.event.PaymentCompletedEvent;
import com.project.orderservice.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class PaymentEventConsumer {

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    public PaymentEventConsumer(OrderService orderService, ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "payment-completed", groupId = "payment-completed-group")
    public void consume(String message) throws JsonProcessingException {

        PaymentCompletedEvent event =
                objectMapper.readValue(message, PaymentCompletedEvent.class);

        log.info("Received payment completed event: {}",event);

        System.out.println("OrderId: "+event.getOrderId()+"\n OrderStatus: "+event.getStatus());

        orderService.updateOrderStatus(event.getOrderId(),event.getStatus());

    }
}
