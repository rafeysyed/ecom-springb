package com.project.paymentservice.service;

import com.project.paymentservice.dto.PaymentProcessRequest;
import com.project.paymentservice.exception.PaymentNetworkException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
public class PaymentEngine {

    public PaymentResult evaluate(PaymentProcessRequest request) {
        String method = request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "CARD";

        if ("COD".equals(method)) {
            return PaymentResult.success(
                    "COD_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    "N/A",
                    "COD"
            );
        }

        if ("UPI".equals(method)) {
            String vpa = request.getVpa() != null ? request.getVpa().trim().toLowerCase() : "";
            if (vpa.contains("fail") || vpa.contains("decline")) {
                return PaymentResult.failed(
                        "UPI_PAYMENT_FAILED",
                        "U30",
                        "Payment request was declined in UPI app",
                        "N/A",
                        "UPI"
                );
            }
            if (vpa.contains("insufficient")) {
                return PaymentResult.failed(
                        "INSUFFICIENT_FUNDS",
                        "U19",
                        "Insufficient funds in bank account associated with UPI",
                        "N/A",
                        "UPI"
                );
            }
            return PaymentResult.success(
                    "UPI_" + System.currentTimeMillis(),
                    "N/A",
                    "UPI"
            );
        }

        // CARD evaluation
        String rawCard = request.getCardNumber() != null ? request.getCardNumber().replaceAll("[^0-9]", "") : "4242";
        String last4 = rawCard.length() >= 4 ? rawCard.substring(rawCard.length() - 4) : "4242";
        String brand = detectCardBrand(rawCard);
        String cvv = request.getCvv() != null ? request.getCvv().trim() : "123";

        log.info("Evaluating payment for order: {}, card ending in: {}, brand: {}", request.getOrderId(), last4, brand);

        // Factor 11: Network Failure simulation
        if (last4.equals("9999")) {
            log.warn("Triggering simulated transient network failure for card ending in 9999");
            throw new PaymentNetworkException("Simulated bank network gateway timeout / connection reset");
        }

        // Factor 5: Insufficient Funds
        if (last4.equals("0051")) {
            return PaymentResult.failed(
                    "INSUFFICIENT_FUNDS",
                    "51",
                    "Transaction declined: Insufficient funds in account.",
                    last4,
                    brand
            );
        }

        // Factor 4: Payment Timeout simulation
        if (last4.equals("0004")) {
            return PaymentResult.timedOut("Transaction timed out waiting for gateway response.");
        }

        // Factor 6: 3D Secure Authentication required
        if (last4.equals("3333")) {
            return PaymentResult.requiresAction(
                    UUID.randomUUID().toString(),
                    last4,
                    brand
            );
        }

        // Factor 2: Card Declined / Invalid CVV
        if (last4.equals("0002") || "000".equals(cvv)) {
            return PaymentResult.failed(
                    "CARD_DECLINED",
                    "05",
                    "Transaction declined: Do not honor / invalid card details.",
                    last4,
                    brand
            );
        }

        // Factor 1: Payment Success
        String txnRef = "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return PaymentResult.success(txnRef, last4, brand);
    }

    private String detectCardBrand(String cardNumber) {
        if (cardNumber.startsWith("4")) return "VISA";
        if (cardNumber.startsWith("5")) return "MASTERCARD";
        if (cardNumber.startsWith("3")) return "AMEX";
        if (cardNumber.startsWith("6")) return "DISCOVER";
        return "GENERIC_CARD";
    }
}
