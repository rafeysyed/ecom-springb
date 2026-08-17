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
    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 2000),
            dltTopicSuffix = ".DLT"
    )
    public void consume(OrderCreatedEvent event) throws JsonProcessingException {

        log.info("Received Order Created Event: {}", event);

        paymentService.processPayment(
                event.getOrderId(),
                event.getUserId(),
                Double.parseDouble(event.getTotalAmount())
        );

        //Simulate payment processing
        log.info("Processing payment for order {}", event.getOrderId());

    }
}
