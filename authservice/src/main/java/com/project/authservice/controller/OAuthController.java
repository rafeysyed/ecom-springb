package com.project.authservice.controller;

import com.project.authservice.dto.OAuthLoginRequest;
import com.project.authservice.dto.OAuthLoginResponse;
import com.project.authservice.service.OAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/auth/oauth")
@RequiredArgsConstructor
@Slf4j
public class OAuthController {

    private final OAuthService oAuthService;

    @PostMapping("/login")
    public ResponseEntity<OAuthLoginResponse> oAuthLogin(@RequestBody OAuthLoginRequest request) {
        log.info("Received OAuth login request for provider: {}", request.getProvider());
        OAuthLoginResponse response = oAuthService.processOAuthLogin(request);
        return ResponseEntity.ok(response);
    }
}
