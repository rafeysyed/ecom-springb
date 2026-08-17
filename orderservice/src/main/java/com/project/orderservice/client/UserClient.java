package com.project.orderservice.client;

import com.project.orderservice.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

//@FeignClient(name = "user-service", url = "http://localhost:8082")
@FeignClient(name = "userservice", configuration = FeignConfig.class)
public interface UserClient {

    @GetMapping("/internal/users/{id}")
    Object getUser(@PathVariable UUID id);
}
