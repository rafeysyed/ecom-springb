package com.project.paymentservice.event;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class PaymentFailedEvent {

    private String orderId;

    private String reason;
}
