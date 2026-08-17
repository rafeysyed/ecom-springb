package com.project.paymentservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.paymentservice.entity.OutboxEvent;
import com.project.paymentservice.entity.Payment;
import com.project.paymentservice.event.PaymentCompletedEvent;
import com.project.paymentservice.event.PaymentFailedEvent;
import com.project.paymentservice.producer.PaymentEventProducer;
import com.project.paymentservice.repository.OutboxRepository;
import com.project.paymentservice.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private PaymentRepository paymentRepository;
    private PaymentEventProducer paymentEventProducer;
    private OutboxRepository outboxRepository;
    private ObjectMapper objectMapper;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentEventProducer paymentEventProducer,
                          OutboxRepository outboxRepository,
                          ObjectMapper objectMapper){
        this.paymentRepository=paymentRepository;
        this.paymentEventProducer = paymentEventProducer;
        this.outboxRepository = outboxRepository;
        this.objectMapper= objectMapper;
    }

    @Transactional
    public void processPayment(String orderId,String userId, double amount) throws JsonProcessingException {

        //Idempotency -> to check orderId to prevent double payment
        Optional<Payment> existingPayment = paymentRepository.findById(orderId);

        if(existingPayment.isPresent()){
            return;
        }

        Payment payment =  new Payment();
        payment.setAmount(amount);
        payment.setOrderId(orderId);
        payment.setUserId(userId);
//        payment.setStatus("SUCCESS"); //for testing

        boolean paymentSuccess = simulatePayment();  //temporary simulation
//        boolean paymentSuccess = true;

        if(paymentSuccess){
            payment.setStatus("SUCCESS");
        }else{
            payment.setStatus("FAILED");
        }

        Payment savedPayment =  paymentRepository.save(payment);

        createOutboxEvent(savedPayment);
    }

    private boolean simulatePayment() {  // to test event 50% success or 50% failure
        return Math.random()>0.5;
    }

    private void createOutboxEvent(Payment savedPayment) throws JsonProcessingException {

        OutboxEvent outboxEvent = new OutboxEvent();
        if("SUCCESS".equals(savedPayment.getStatus())){

            PaymentCompletedEvent event = new PaymentCompletedEvent();
            event.setPaymentId(savedPayment.getPaymentId());
            event.setOrderId(savedPayment.getOrderId());
            event.setStatus(savedPayment.getStatus());

            outboxEvent.setEventType("payment-completed");
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
        }
        else {
            PaymentFailedEvent event =  new PaymentFailedEvent();
            event.setOrderId(savedPayment.getOrderId());
            event.setReason("PAYMENT_FAILED");

            outboxEvent.setEventType("payment-failed");
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
        }

        outboxEvent.setPublished(false);
        outboxRepository.save(outboxEvent);
    }
}
