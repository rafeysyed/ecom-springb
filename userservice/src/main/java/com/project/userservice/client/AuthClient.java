package com.project.userservice.client;

import com.project.userservice.dto.CreateCredentialRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "AuthService")
public interface AuthClient {

    @PostMapping("/internal/auth/create-credentials")
    void createCredentials(@RequestBody CreateCredentialRequest request);
}
