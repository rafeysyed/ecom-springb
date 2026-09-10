package com.project.paymentservice.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.project.paymentservice.dto.*;
import com.project.paymentservice.entity.PaymentWebhookLog;
import com.project.paymentservice.repository.PaymentWebhookLogRepository;
import com.project.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentWebhookLogRepository webhookLogRepository;

    @PostMapping("/process")
    public ResponseEntity<PaymentProcessResponse> processPayment(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKeyHeader,
            @RequestBody PaymentProcessRequest request) throws JsonProcessingException {

        if (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank()) {
            request.setIdempotencyKey(idempotencyKeyHeader);
        }

        PaymentProcessResponse response = paymentService.processPayment(request);

        if ("SUCCESS".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else if ("REQUIRES_ACTION".equals(response.getStatus())) {
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(response);
        }
    }

    @PostMapping("/confirm-3ds")
    public ResponseEntity<PaymentProcessResponse> confirm3ds(@RequestBody Confirm3dsRequest request)
            throws JsonProcessingException {
        PaymentProcessResponse response = paymentService.confirm3ds(request);
        if ("SUCCESS".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<PaymentProcessResponse> cancelPayment(@RequestBody PaymentCancelRequest request)
            throws JsonProcessingException {
        return ResponseEntity.ok(paymentService.cancelPayment(request));
    }

    @PostMapping("/refund")
    public ResponseEntity<RefundResponse> refundPayment(@RequestBody RefundRequest request) {
        return ResponseEntity.ok(paymentService.refundPayment(request));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentProcessResponse> getPaymentByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    /**
     * Factor 8: Webhook Ingestion with Transactional Inbox logging.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handleWebhook(
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature,
            @RequestBody String rawPayload) {

        log.info("Received incoming payment webhook with signature: {}", signature);

        PaymentWebhookLog logEntry = PaymentWebhookLog.builder()
                .provider("SANDBOX_GATEWAY")
                .eventType("PAYMENT_GATEWAY_EVENT")
                .payload(rawPayload)
                .signature(signature)
                .status("PROCESSED")
                .processedAt(LocalDateTime.now())
                .build();

        webhookLogRepository.save(logEntry);

        return ResponseEntity.ok(Map.of(
                "received", true,
                "webhookId", logEntry.getId(),
                "status", "ACKNOWLEDGED"
        ));
    }
}
