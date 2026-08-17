package com.project.paymentservice.service;

import com.project.paymentservice.entity.OutboxEvent;
import com.project.paymentservice.repository.OutboxRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class OutboxPublisher {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String,String> kafkaTemplate;

    public OutboxPublisher(OutboxRepository outboxRepository,
                           KafkaTemplate<String,String> kafkaTemplate){
        this.kafkaTemplate=kafkaTemplate;
        this.outboxRepository=outboxRepository;
    }


    @Scheduled(fixedDelay = 5000)
    public void publishEvents(){

        List<OutboxEvent> outboxEventList = outboxRepository.findByPublishedFalse();
        for(OutboxEvent event: outboxEventList){

            System.out.println("Publishing to topic: " + event.getEventType());
            System.out.println("Payload: " + event.getPayload());

            kafkaTemplate.send(event.getEventType(),event.getPayload());
            event.setPublished(true);
            outboxRepository.save(event);
            log.info("Published event {}", event.getId());
        }
    }

}
