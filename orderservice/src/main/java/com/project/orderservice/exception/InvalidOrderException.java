package com.project.orderservice.exception;

public class InvalidOrderException extends RuntimeException{

    public InvalidOrderException(String message){
        super(message);
    }
}
