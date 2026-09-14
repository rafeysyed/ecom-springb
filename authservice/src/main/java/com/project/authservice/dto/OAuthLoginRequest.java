package com.project.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OAuthLoginRequest {

    private String provider; // "GOOGLE" | "GITHUB"

    private String code;

    private String redirectUri;

    private Boolean isDemo;

    private String demoEmail;

    private String demoName;
}
