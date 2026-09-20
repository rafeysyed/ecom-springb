package com.project.userservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    public void sendOrderStatusEmail(String recipientEmail, String orderId, String status, String title, String message, String trackingUrl) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Cannot send order status email: recipient email is missing for order {}", orderId);
            return;
        }

        log.info("""
                ====================== OUTGOING EMAIL NOTIFICATION ======================
                TO: {}
                SUBJECT: {} - Order #{}
                STATUS: {}
                MESSAGE: {}
                TRACKING LINK: {}
                =========================================================================
                """, recipientEmail, title, orderId, status, message, trackingUrl);

        // Hook for JavaMailSender or third-party email API (e.g., SendGrid, AWS SES) in production:
        // try {
        //     SimpleMailMessage mailMessage = new SimpleMailMessage();
        //     mailMessage.setTo(recipientEmail);
        //     mailMessage.setSubject(title + " - Order #" + orderId);
        //     mailMessage.setText(message + "\n\nTrack your order: " + trackingUrl);
        //     mailSender.send(mailMessage);
        // } catch (Exception e) {
        //     log.error("Failed to deliver email to {}: {}", recipientEmail, e.getMessage());
        // }
    }
}
