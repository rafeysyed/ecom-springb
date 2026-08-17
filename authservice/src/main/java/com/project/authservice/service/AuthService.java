package com.project.authservice.service;

import com.project.authservice.client.UserClient;
import com.project.authservice.dto.CreateCredentialRequest;
import com.project.authservice.dto.LoginRequest;
import com.project.authservice.dto.LoginResponse;
import com.project.authservice.dto.UserInternalResponse;
import com.project.authservice.entity.AuthUser;
import com.project.authservice.entity.Role;
import com.project.authservice.repository.AuthUserRepository;
import com.project.authservice.repository.RoleRepository;
import com.project.authservice.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthUserRepository authUserRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserClient userClient;

    private final JwtService jwtService;

    public AuthService(AuthUserRepository authUserRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, UserClient userClient, JwtService jwtService) {
        this.authUserRepository = authUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.userClient = userClient;
        this.jwtService = jwtService;
    }

    public void testUserLookUp(String email){

        UserInternalResponse user = userClient.getUserByEmail(email);

        System.out.println("Test UserId from Userservice: "+user.getUserId());
    }

    public void createCredentials(CreateCredentialRequest request){

        UUID userId = request.getUserId();

        if(authUserRepository.existsById(userId)){
            return; //Credentials already exist
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        Role role = roleRepository.findByRoleName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Role does not exist"));

        AuthUser authUser = new AuthUser();
        authUser.setUserId(userId);
        authUser.setPasswordHash(encodedPassword);

        Set<Role> roles = new HashSet<>();
        roles.add(role);

        authUser.setRoles(roles);

        authUserRepository.save(authUser);
    }

    public LoginResponse login(LoginRequest request){

        //get userId from userservice
        UserInternalResponse user = userClient.getUserByEmail(request.getEmail());

        //find credentials using userId
        AuthUser authUser = authUserRepository.findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Invalid Credentials"));

        //check password
        if(!passwordEncoder.matches(request.getPassword(), authUser.getPasswordHash())){
            throw new RuntimeException("Invalid Credentials");
        }

        String token = jwtService.generateToken(authUser.getUserId(),authUser.getRoles());

        //generate token (temporary)
//        String token = "dummy-token";

        return new LoginResponse(token);
    }
}
