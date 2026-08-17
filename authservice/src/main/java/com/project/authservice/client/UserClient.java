package com.project.authservice.client;

import com.project.authservice.dto.UserInternalResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "userservice")
public interface UserClient {

    @GetMapping("/internal/users/by-email")
    UserInternalResponse getUserByEmail(@RequestParam String email);

}
