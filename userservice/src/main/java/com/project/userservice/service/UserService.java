package com.project.userservice.service;

import com.project.userservice.client.AuthClient;
import com.project.userservice.dto.CreateCredentialRequest;
import com.project.userservice.dto.RegisterRequest;
import com.project.userservice.dto.UserInternalResponse;
import com.project.userservice.entity.User;
import com.project.userservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthClient authClient;

    public UserService(UserRepository userRepository, AuthClient authClient){
        this.userRepository=userRepository;
        this.authClient = authClient;
    }


    public User createUser(User user){
        return userRepository.save(user);
    }

    public User getUser(UUID user){

       return userRepository.findById(user)
               .orElseThrow(() -> new RuntimeException("User not found with this userId: "+user));
    }


    public void registerUser(RegisterRequest request){

        User user = new User();

        user.setName(request.getUsername());
        user.setEmail(request.getEmail());

        User savedUser = userRepository.save(user);

        CreateCredentialRequest credentialRequest = new CreateCredentialRequest();
        credentialRequest.setUserId(savedUser.getUserId());
        credentialRequest.setPassword(request.getPassword());

        authClient.createCredentials(credentialRequest);
    }

    public UserInternalResponse getUserByEmail(String email) {

        System.out.println("Searching email: " + email);

        userRepository.findAll().forEach(e->
                System.out.println("DB email: "+e.getEmail())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("user not found with this email"+email));

        return new UserInternalResponse(
                user.getUserId(),
                user.getEmail()
        );
    }
}
