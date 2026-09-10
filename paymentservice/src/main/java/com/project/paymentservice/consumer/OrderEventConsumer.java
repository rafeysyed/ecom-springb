package com.project.paymentservice.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.project.paymentservice.event.OrderCreatedEvent;
import com.project.paymentservice.service.PaymentService;
import lombok.extern.slf4j.Slf4j;


import org.springframework.kafka.annotation.KafkaListener;

import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class OrderEventConsumer {

    private PaymentService paymentService;

    public OrderEventConsumer(PaymentService paymentService){
        this.paymentService=paymentService;
    }

    @KafkaListener(
            topics = "order-created",
            groupId = "payment-group"
    )
    public void consume(OrderCreatedEvent event) {
        log.info("Received Order Created Event for order: {}, user: {}, amount: {}. Awaiting customer payment via checkout.",
                event.getOrderId(), event.getUserId(), event.getTotalAmount());
    }
}
