package com.project.orderservice.producer;

import com.project.orderservice.event.OrderCreatedEvent;
import com.project.orderservice.event.OrderStatusEvent;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Getter
@Setter
@Service
public class OrderEventProducer {

    public static final String ORDER_CREATED_TOPIC = "order-created";
    public static final String ORDER_STATUS_TOPIC = "order-status-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendOrderCreatedEvent(OrderCreatedEvent event){
        log.info("Publishing OrderCreatedEvent for order: {}", event.getOrderId());
        kafkaTemplate.send(ORDER_CREATED_TOPIC, event);
    }

    public void sendOrderStatusEvent(OrderStatusEvent event){
        log.info("Publishing OrderStatusEvent: orderId={}, status={}, title={}", 
                event.getOrderId(), event.getStatus(), event.getTitle());
        kafkaTemplate.send(ORDER_STATUS_TOPIC, event.getOrderId(), event);
    }
}
