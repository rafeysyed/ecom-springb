package com.project.paymentservice.producer;

import com.project.paymentservice.event.PaymentCompletedEvent;
import lombok.Getter;
import lombok.Setter;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;


@Getter
@Setter
@Component
public class PaymentEventProducer {

    private final KafkaTemplate<String, PaymentCompletedEvent> kafkaTemplate;

    public PaymentEventProducer(KafkaTemplate<String,PaymentCompletedEvent> kafkaTemplate){
        this.kafkaTemplate=kafkaTemplate;
    }

    public void sendPaymentCompletedEvent(PaymentCompletedEvent event){
        kafkaTemplate.send("payment-completed",event);
    }
}
