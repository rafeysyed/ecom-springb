package com.project.orderservice.consumer;

import org.springframework.kafka.annotation.DltHandler;
import org.springframework.stereotype.Component;

@Component
public class PaymentFailedDLTConsumer {

    @DltHandler
    public void handleDLT(String message){

        System.out.println("DLT received message: "+message);
    }
}
