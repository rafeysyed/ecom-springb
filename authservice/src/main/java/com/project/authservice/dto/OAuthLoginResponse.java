package com.project.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OAuthLoginResponse {

    private String token;

    private UUID userId;

    private String email;

    private String name;

    private List<String> roles;

    private String provider;
}
