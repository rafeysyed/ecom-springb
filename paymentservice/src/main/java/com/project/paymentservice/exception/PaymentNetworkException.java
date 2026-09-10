package com.project.paymentservice.exception;

public class PaymentNetworkException extends RuntimeException {
    public PaymentNetworkException(String message) {
        super(message);
    }
}
