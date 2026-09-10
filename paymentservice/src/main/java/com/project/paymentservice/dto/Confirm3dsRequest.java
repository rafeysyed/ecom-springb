package com.project.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Confirm3dsRequest {

    private String orderId;
    private String otp; // e.g. "123456" for success, anything else for failure
}
