package com.project.orderservice.exception;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ApiErrorResponse {

    private LocalDateTime timestamp;

    private int status;

    private String message;

    public ApiErrorResponse(LocalDateTime timestamp, int status, String message){
        this.message=message;
        this.timestamp=timestamp;
        this.status=status;
    }
}
