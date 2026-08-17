package com.project.userservice.controller;

import com.project.userservice.dto.RegisterRequest;
import com.project.userservice.dto.UserInternalResponse;
import com.project.userservice.entity.User;
import com.project.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("internal/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService=userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody RegisterRequest request){

        userService.registerUser(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/by-email")
    public UserInternalResponse getUserByEmail(@RequestParam String email){

        return userService.getUserByEmail(email);
    }


    @PostMapping
    public User createUser(@RequestBody User user){
      return userService.createUser(user);
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable UUID id){
        return userService.getUser(id);
    }
}
