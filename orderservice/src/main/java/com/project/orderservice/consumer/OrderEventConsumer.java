package com.project.orderservice.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.orderservice.entity.Order;
import com.project.orderservice.entity.OrderStatus;
import com.project.orderservice.entity.ProcessedEvent;
import com.project.orderservice.event.PaymentFailedEvent;
import com.project.orderservice.repository.OrderRepository;
import com.project.orderservice.repository.ProcessedEventRepository;
import com.project.orderservice.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.RetryableTopic;
import org.springframework.kafka.retrytopic.TopicSuffixingStrategy;
import org.springframework.retry.annotation.Backoff;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
public class OrderEventConsumer {

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;
    private final ProcessedEventRepository processedEventRepository;

    public OrderEventConsumer(OrderRepository orderRepository, OrderService orderService, ObjectMapper objectMapper,
                              ProcessedEventRepository processedEventRepository) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.objectMapper = objectMapper;
        this.processedEventRepository = processedEventRepository;
    }

    @RetryableTopic(
            attempts = "3",
            backoff = @Backoff(delay = 2000),
            topicSuffixingStrategy = TopicSuffixingStrategy.SUFFIX_WITH_INDEX_VALUE,
            dltTopicSuffix = "-dlt"
    )
    @KafkaListener(
            topics = "payment-failed",
            groupId = "payment-failed-group"
    )

    public void handlePaymentFailed(String message) throws JsonProcessingException {

        PaymentFailedEvent event =
                objectMapper.readValue(message, PaymentFailedEvent.class);

        //Idempotency
        if(processedEventRepository.existsById(event.getOrderId())){
            log.info("Duplicate event ignored for orderId: {}", event.getOrderId());
            return;
        }

        System.out.println("Received PaymentFailedEvent for orderId: " + event.getOrderId());

        Order order = orderRepository.findById(UUID.fromString(event.getOrderId()))
                .orElseThrow(() -> new RuntimeException(
                        "OrderId is not found to handle payment failure event: "
                +event.getOrderId()));

        order.setStatus(OrderStatus.FAILED);
//        orderService.updateOrderStatus(event.getOrderId(),OrderStatus.FAILED.toString());
        orderRepository.save(order);

        ProcessedEvent pEvent = new ProcessedEvent();
        pEvent.setEventId(event.getOrderId());
        pEvent.setProcessedAt(Instant.now());
        processedEventRepository.save(pEvent);
    }
}
