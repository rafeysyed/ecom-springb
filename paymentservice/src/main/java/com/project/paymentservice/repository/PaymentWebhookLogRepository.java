package com.project.paymentservice.repository;

import com.project.paymentservice.entity.PaymentWebhookLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentWebhookLogRepository extends JpaRepository<PaymentWebhookLog, String> {

    List<PaymentWebhookLog> findByStatus(String status);
}
