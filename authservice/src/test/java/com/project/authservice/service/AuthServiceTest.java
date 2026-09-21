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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthUserRepository authUserRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserClient userClient;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private UUID sampleUserId;
    private Role userRole;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        userRole = new Role();
        userRole.setRoleName("ROLE_USER");
    }

    @Test
    @DisplayName("createCredentials: should encode password and assign default role for new user")
    void createCredentials_WhenNewUser_ShouldEncodeAndSave() {
        CreateCredentialRequest request = new CreateCredentialRequest();
        request.setUserId(sampleUserId);
        request.setPassword("plainPassword123");

        when(authUserRepository.existsById(sampleUserId)).thenReturn(false);
        when(passwordEncoder.encode("plainPassword123")).thenReturn("hashedPasswordXYZ");
        when(roleRepository.findByRoleName("ROLE_USER")).thenReturn(Optional.of(userRole));

        authService.createCredentials(request);

        verify(authUserRepository, times(1)).save(argThat(user ->
                sampleUserId.equals(user.getUserId()) &&
                "hashedPasswordXYZ".equals(user.getPasswordHash()) &&
                user.getRoles().contains(userRole)
        ));
    }

    @Test
    @DisplayName("createCredentials: should not duplicate if credentials already exist")
    void createCredentials_WhenAlreadyExists_ShouldReturnEarly() {
        CreateCredentialRequest request = new CreateCredentialRequest();
        request.setUserId(sampleUserId);
        request.setPassword("plainPassword123");

        when(authUserRepository.existsById(sampleUserId)).thenReturn(true);

        authService.createCredentials(request);

        verify(authUserRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("login: should validate password and issue JWT token")
    void login_WhenValidCredentials_ShouldReturnJwt() {
        LoginRequest request = new LoginRequest("user@example.com", "mySecretPass");
        UserInternalResponse internalUser = new UserInternalResponse(sampleUserId, "user@example.com", "John Doe");

        AuthUser authUser = new AuthUser();
        authUser.setUserId(sampleUserId);
        authUser.setPasswordHash("hashedPass");
        authUser.setRoles(Set.of(userRole));

        when(userClient.getUserByEmail("user@example.com")).thenReturn(internalUser);
        when(authUserRepository.findById(sampleUserId)).thenReturn(Optional.of(authUser));
        when(passwordEncoder.matches("mySecretPass", "hashedPass")).thenReturn(true);
        when(jwtService.generateToken(eq(sampleUserId), anySet())).thenReturn("jwt.token.here");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt.token.here", response.getToken());
        verify(jwtService, times(1)).generateToken(eq(sampleUserId), anySet());
    }

    @Test
    @DisplayName("login: should throw exception when password does not match")
    void login_WhenPasswordIncorrect_ShouldThrowException() {
        LoginRequest request = new LoginRequest("user@example.com", "wrongPass");
        UserInternalResponse internalUser = new UserInternalResponse(sampleUserId, "user@example.com", "John Doe");

        AuthUser authUser = new AuthUser();
        authUser.setUserId(sampleUserId);
        authUser.setPasswordHash("hashedPass");

        when(userClient.getUserByEmail("user@example.com")).thenReturn(internalUser);
        when(authUserRepository.findById(sampleUserId)).thenReturn(Optional.of(authUser));
        when(passwordEncoder.matches("wrongPass", "hashedPass")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("Invalid Credentials", ex.getMessage());
        verify(jwtService, never()).generateToken(any(), any());
    }
}
