package com.project.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OAuthUserProfile {

    private String email;

    private String name;

    private String providerId;

    private String avatarUrl;

    private String provider; // "GOOGLE" | "GITHUB"
}
