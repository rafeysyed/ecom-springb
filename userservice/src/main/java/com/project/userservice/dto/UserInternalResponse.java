package com.project.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class UserInternalResponse {

    private UUID userId;

    private String email;

}
