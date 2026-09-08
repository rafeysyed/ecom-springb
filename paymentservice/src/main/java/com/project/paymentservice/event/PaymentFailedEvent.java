package com.project.paymentservice.event;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentFailedEvent {

    private String orderId;

    private String reason;
}
