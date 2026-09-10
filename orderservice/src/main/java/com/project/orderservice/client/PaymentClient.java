package com.project.orderservice.client;

import com.project.orderservice.dto.payment.PaymentRefundRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "paymentservice")
public interface PaymentClient {

    @PostMapping("/payments/refund")
    Map<String, Object> refundPayment(@RequestBody PaymentRefundRequest request);
}
