package com.project.paymentservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.paymentservice.dto.*;
import com.project.paymentservice.entity.OutboxEvent;
import com.project.paymentservice.entity.Payment;
import com.project.paymentservice.entity.Refund;
import com.project.paymentservice.event.PaymentCompletedEvent;
import com.project.paymentservice.event.PaymentFailedEvent;
import com.project.paymentservice.exception.PaymentNetworkException;
import com.project.paymentservice.repository.OutboxRepository;
import com.project.paymentservice.repository.PaymentRepository;
import com.project.paymentservice.repository.RefundRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final OutboxRepository outboxRepository;
    private final PaymentEngine paymentEngine;
    private final ObjectMapper objectMapper;

    /**
     * Backward-compatible method called from Kafka OrderEventConsumer.
     */
    @Transactional
    public void processPayment(String orderId, String userId, double amount) throws JsonProcessingException {
        PaymentProcessRequest request = PaymentProcessRequest.builder()
                .orderId(orderId)
                .userId(userId)
                .amount(amount)
                .paymentMethod("CARD")
                .cardNumber("4242424242424242")
                .cvv("123")
                .cardExpiry("12/28")
                .build();
        processPayment(request);
    }

    /**
     * Comprehensive payment processing supporting all 11 factors.
     */
    @Transactional
    @Retryable(
            retryFor = PaymentNetworkException.class,
            maxAttempts = 3,
            backoff = @Backoff(delay = 500, multiplier = 2.0)
    )
    public PaymentProcessResponse processPayment(PaymentProcessRequest request) throws JsonProcessingException {
        String orderId = request.getOrderId();
        log.info("Starting payment processing for orderId: {}", orderId);

        // Factor 7: Duplicate Payment / Idempotency Check
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            Optional<Payment> existingByIdem = paymentRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existingByIdem.isPresent()) {
                log.info("Idempotency key matched existing transaction for orderId: {}", orderId);
                return mapToResponse(existingByIdem.get(), "Duplicate request: returned existing transaction record");
            }
        }

        Optional<Payment> existingPayment = paymentRepository.findByOrderId(orderId);
        if (existingPayment.isPresent()) {
            Payment p = existingPayment.get();
            // If already successfully processed, do not double-charge!
            if ("SUCCESS".equals(p.getStatus())) {
                log.info("Payment for order {} already has completed status: {}", orderId, p.getStatus());
                return mapToResponse(p, "Order already has an active or completed payment");
            }
        }

        // Evaluate via PaymentEngine (Simulates or routes to gateway)
        PaymentResult result;
        try {
            result = paymentEngine.evaluate(request);
        } catch (PaymentNetworkException e) {
            log.warn("Network error during payment attempt for order {}: {}", orderId, e.getMessage());
            throw e; // Triggers @Retryable
        }

        Payment payment = existingPayment.orElseGet(Payment::new);
        payment.setOrderId(orderId);
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");
        payment.setIdempotencyKey(request.getIdempotencyKey());
        payment.setStatus(result.getStatus());
        payment.setTransactionReference(result.getTransactionReference());
        payment.setFailureReason(result.getFailureReason());
        payment.setFailureCode(result.getFailureCode());
        payment.setCardLast4(result.getCardLast4());
        payment.setCardBrand(result.getCardBrand());

        Payment savedPayment = paymentRepository.save(payment);

        // Handle State & Outbox Publication
        if ("SUCCESS".equals(result.getStatus())) {
            createOutboxEvent(savedPayment, "payment-completed");
        } else if ("FAILED".equals(result.getStatus()) || "TIMED_OUT".equals(result.getStatus())) {
            createOutboxEvent(savedPayment, "payment-failed");
        }
        // Notice: If status is REQUIRES_ACTION (3DS), we wait for customer OTP verification before publishing to Kafka.

        return mapToResponse(savedPayment, result.getMessage(), result.isOtpChallengeRequired(), result.getChallengeId());
    }

    /**
     * Recovery method if all network retries fail (Factor 11).
     */
    @Recover
    @Transactional
    public PaymentProcessResponse recoverFromNetworkFailure(PaymentNetworkException e, PaymentProcessRequest request) throws JsonProcessingException {
        log.error("All network retries failed for orderId {}: {}", request.getOrderId(), e.getMessage());

        Payment payment = paymentRepository.findByOrderId(request.getOrderId()).orElseGet(Payment::new);
        payment.setOrderId(request.getOrderId());
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD");
        payment.setStatus("FAILED");
        payment.setFailureReason("NETWORK_FAILURE");
        payment.setFailureCode("NET_504");

        Payment saved = paymentRepository.save(payment);
        createOutboxEvent(saved, "payment-failed");

        return mapToResponse(saved, "Payment failed: Gateway network connection timed out after retries.");
    }

    /**
     * Factor 6: Confirm 3D Secure OTP authentication.
     */
    @Transactional
    public PaymentProcessResponse confirm3ds(Confirm3dsRequest request) throws JsonProcessingException {
        log.info("Processing 3DS confirmation for orderId: {}", request.getOrderId());
        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + request.getOrderId()));

        if (!"REQUIRES_ACTION".equals(payment.getStatus())) {
            return mapToResponse(payment, "Payment is not awaiting 3DS confirmation: " + payment.getStatus());
        }

        // Test OTP: 123456 succeeds, any other code fails authentication
        if ("123456".equals(request.getOtp() != null ? request.getOtp().trim() : "")) {
            payment.setStatus("SUCCESS");
            payment.setTransactionReference("TXN_3DS_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
            payment.setFailureReason(null);
            payment.setFailureCode(null);

            Payment saved = paymentRepository.save(payment);
            createOutboxEvent(saved, "payment-completed");
            return mapToResponse(saved, "3D Secure authentication successful. Payment completed.");
        } else {
            payment.setStatus("FAILED");
            payment.setFailureReason("AUTHENTICATION_FAILED");
            payment.setFailureCode("3DS_01");

            Payment saved = paymentRepository.save(payment);
            createOutboxEvent(saved, "payment-failed");
            return mapToResponse(saved, "3D Secure authentication failed: Invalid OTP entered.");
        }
    }

    /**
     * Factor 3: Cancel in-flight payment.
     */
    @Transactional
    public PaymentProcessResponse cancelPayment(PaymentCancelRequest request) throws JsonProcessingException {
        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + request.getOrderId()));

        if ("SUCCESS".equals(payment.getStatus())) {
            throw new IllegalStateException("Payment is already completed. Please use the refund endpoint.");
        }

        payment.setStatus("CANCELLED");
        payment.setFailureReason(request.getReason() != null ? request.getReason() : "USER_CANCELLED");

        Payment saved = paymentRepository.save(payment);
        createOutboxEvent(saved, "payment-failed");

        return mapToResponse(saved, "Payment was cancelled.");
    }

    /**
     * Factors 9 & 10: Full and Partial Refunds.
     */
    @Transactional
    public RefundResponse refundPayment(RefundRequest request) {
        String orderId = request.getOrderId();
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + orderId));

        if (!"SUCCESS".equals(payment.getStatus()) && !"PARTIALLY_REFUNDED".equals(payment.getStatus())) {
            throw new IllegalStateException("Cannot refund payment with status: " + payment.getStatus());
        }

        double availableToRefund = payment.getAmount() - payment.getAmountRefunded();
        double refundAmount = (request.getAmount() != null && request.getAmount() > 0)
                ? request.getAmount()
                : availableToRefund; // Default to full refund

        if (refundAmount > availableToRefund) {
            throw new IllegalArgumentException(String.format("Requested refund amount (%.2f) exceeds available refundable balance (%.2f)",
                    refundAmount, availableToRefund));
        }

        // Create Refund record
        Refund refund = Refund.builder()
                .paymentId(payment.getPaymentId())
                .orderId(orderId)
                .amount(refundAmount)
                .reason(request.getReason() != null ? request.getReason() : "CUSTOMER_RETURN")
                .status("SUCCESS")
                .refundReference("REF_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .build();
        refundRepository.save(refund);

        // Update Payment status
        payment.setAmountRefunded(payment.getAmountRefunded() + refundAmount);
        if (payment.getAmountRefunded() >= payment.getAmount()) {
            payment.setStatus("FULLY_REFUNDED");
        } else {
            payment.setStatus("PARTIALLY_REFUNDED");
        }
        paymentRepository.save(payment);

        log.info("Processed refund for order {}: amount {}, status {}", orderId, refundAmount, payment.getStatus());

        return RefundResponse.builder()
                .refundId(refund.getRefundId())
                .orderId(orderId)
                .paymentId(payment.getPaymentId())
                .amountRefunded(refundAmount)
                .totalRefunded(payment.getAmountRefunded())
                .remainingAmount(payment.getAmount() - payment.getAmountRefunded())
                .status("SUCCESS")
                .paymentStatus(payment.getStatus())
                .message("Refund processed successfully")
                .build();
    }

    public PaymentProcessResponse getPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + orderId));
        return mapToResponse(payment, "Payment details retrieved");
    }

    /**
     * Factor 4: Watchdog for payment timeouts.
     * Sweeps every 60 seconds for stale pending/3DS payments older than 15 minutes.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void sweepTimedOutPayments() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(15);
        List<Payment> stalePayments = paymentRepository.findByStatusAndCreatedAtBefore("REQUIRES_ACTION", cutoff);

        for (Payment payment : stalePayments) {
            log.warn("Expiring timed-out 3DS payment for order: {}", payment.getOrderId());
            payment.setStatus("TIMED_OUT");
            payment.setFailureReason("PAYMENT_TIMEOUT");
            payment.setFailureCode("TIMEOUT_408");
            paymentRepository.save(payment);

            try {
                createOutboxEvent(payment, "payment-failed");
            } catch (JsonProcessingException e) {
                log.error("Error creating timeout outbox event for order {}: {}", payment.getOrderId(), e.getMessage());
            }
        }
    }

    private void createOutboxEvent(Payment savedPayment, String eventType) throws JsonProcessingException {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setEventType(eventType);

        if ("payment-completed".equals(eventType)) {
            PaymentCompletedEvent event = new PaymentCompletedEvent();
            event.setPaymentId(savedPayment.getPaymentId());
            event.setOrderId(savedPayment.getOrderId());
            event.setStatus(savedPayment.getStatus());
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
        } else {
            PaymentFailedEvent event = new PaymentFailedEvent();
            event.setOrderId(savedPayment.getOrderId());
            event.setReason(savedPayment.getFailureReason() != null ? savedPayment.getFailureReason() : "PAYMENT_FAILED");
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
        }

        outboxEvent.setPublished(false);
        outboxRepository.save(outboxEvent);
    }

    private PaymentProcessResponse mapToResponse(Payment p, String message) {
        return mapToResponse(p, message, false, null);
    }

    private PaymentProcessResponse mapToResponse(Payment p, String message, boolean otpRequired, String challengeId) {
        return PaymentProcessResponse.builder()
                .paymentId(p.getPaymentId())
                .orderId(p.getOrderId())
                .status(p.getStatus())
                .transactionReference(p.getTransactionReference())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .paymentMethod(p.getPaymentMethod())
                .failureReason(p.getFailureReason())
                .failureCode(p.getFailureCode())
                .otpChallengeRequired(otpRequired)
                .challengeId(challengeId)
                .message(message)
                .build();
    }
}
