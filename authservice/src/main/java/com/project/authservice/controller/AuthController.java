package com.project.authservice.controller;

import com.project.authservice.dto.CreateCredentialRequest;
import com.project.authservice.dto.LoginRequest;
import com.project.authservice.dto.LoginResponse;
import com.project.authservice.entity.AuthUser;
import com.project.authservice.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/internal/auth")
@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/create-credentials")
    public ResponseEntity<AuthUser> createCredentials(
            @RequestBody CreateCredentialRequest request){

        authService.createCredentials(request);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/testUser")
    public String testGetUserIdByEmail(@RequestParam String email){
        authService.testUserLookUp(email);
        return "Check Authservice console";
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request){

        System.out.println("LOGIN API HIT");
       return authService.login(request);
    }
}
