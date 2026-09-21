package com.project.paymentservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.paymentservice.dto.PaymentProcessRequest;
import com.project.paymentservice.dto.PaymentProcessResponse;
import com.project.paymentservice.entity.OutboxEvent;
import com.project.paymentservice.entity.Payment;
import com.project.paymentservice.repository.OutboxRepository;
import com.project.paymentservice.repository.PaymentRepository;
import com.project.paymentservice.repository.RefundRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private OutboxRepository outboxRepository;

    @Mock
    private PaymentEngine paymentEngine;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private PaymentService paymentService;

    private PaymentProcessRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = PaymentProcessRequest.builder()
                .orderId("order-1001")
                .userId("user-500")
                .amount(149.99)
                .currency("USD")
                .paymentMethod("CARD")
                .cardNumber("4242424242424242")
                .cardExpiry("12/28")
                .cvv("123")
                .idempotencyKey("idem-key-1001")
                .build();
    }

    @Test
    @DisplayName("processPayment: should complete successfully and write payment-completed event to outbox")
    void processPayment_WhenSuccessful_ShouldSaveAndCreateOutboxEvent() throws JsonProcessingException {
        PaymentResult successResult = PaymentResult.success("TXN-123456", "4242", "Visa");

        when(paymentRepository.findByIdempotencyKey("idem-key-1001")).thenReturn(Optional.empty());
        when(paymentRepository.findByOrderId("order-1001")).thenReturn(Optional.empty());
        when(paymentEngine.evaluate(validRequest)).thenReturn(successResult);

        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setPaymentId("pay-uuid-1");
            return p;
        });

        PaymentProcessResponse response = paymentService.processPayment(validRequest);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals("TXN-123456", response.getTransactionReference());

        // Verify payment is saved
        verify(paymentRepository, times(1)).save(any(Payment.class));

        // Verify outbox event is created for Kafka publication (Transactional Outbox Pattern)
        verify(outboxRepository, times(1)).save(argThat(event ->
                "payment-completed".equals(event.getEventType()) &&
                event.getPayload() != null && event.getPayload().contains("order-1001")
        ));
    }

    @Test
    @DisplayName("processPayment: should return existing payment if idempotency key matches")
    void processPayment_WhenIdempotencyKeyMatches_ShouldReturnExistingWithoutChargingAgain() throws JsonProcessingException {
        Payment existingPayment = Payment.builder()
                .paymentId("pay-existing-99")
                .orderId("order-1001")
                .userId("user-500")
                .amount(149.99)
                .status("SUCCESS")
                .transactionReference("TXN-EXISTING")
                .idempotencyKey("idem-key-1001")
                .build();

        when(paymentRepository.findByIdempotencyKey("idem-key-1001")).thenReturn(Optional.of(existingPayment));

        PaymentProcessResponse response = paymentService.processPayment(validRequest);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals("TXN-EXISTING", response.getTransactionReference());

        // Verify payment engine is never called again
        verify(paymentEngine, never()).evaluate(any());
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("processPayment: should save failed payment and record payment-failed in outbox")
    void processPayment_WhenEngineFails_ShouldRecordFailure() throws JsonProcessingException {
        PaymentResult failedResult = PaymentResult.failed("INSUFFICIENT_FUNDS", "DECLINED", "Card has insufficient funds", "4242", "Visa");

        when(paymentRepository.findByIdempotencyKey("idem-key-1001")).thenReturn(Optional.empty());
        when(paymentRepository.findByOrderId("order-1001")).thenReturn(Optional.empty());
        when(paymentEngine.evaluate(validRequest)).thenReturn(failedResult);

        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setPaymentId("pay-failed-1");
            return p;
        });

        PaymentProcessResponse response = paymentService.processPayment(validRequest);

        assertNotNull(response);
        assertEquals("FAILED", response.getStatus());

        // Verify payment-failed event is saved in Outbox table
        verify(outboxRepository, times(1)).save(argThat(event ->
                "payment-failed".equals(event.getEventType()) &&
                event.getPayload() != null && event.getPayload().contains("order-1001")
        ));
    }
}
