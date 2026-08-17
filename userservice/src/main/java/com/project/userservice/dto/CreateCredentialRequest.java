package com.project.userservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateCredentialRequest {

    private UUID userId;

    private String password;
}
