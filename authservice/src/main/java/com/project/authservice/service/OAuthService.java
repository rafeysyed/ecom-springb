package com.project.authservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.authservice.client.UserClient;
import com.project.authservice.dto.OAuthLoginRequest;
import com.project.authservice.dto.OAuthLoginResponse;
import com.project.authservice.dto.OAuthUserProfile;
import com.project.authservice.dto.UserInternalResponse;
import com.project.authservice.entity.AuthUser;
import com.project.authservice.entity.Role;
import com.project.authservice.repository.AuthUserRepository;
import com.project.authservice.repository.RoleRepository;
import com.project.authservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuthService {

    private final AuthUserRepository authUserRepository;
    private final RoleRepository roleRepository;
    private final UserClient userClient;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${oauth2.google.client-id}")
    private String googleClientId;

    @Value("${oauth2.google.client-secret}")
    private String googleClientSecret;

    @Value("${oauth2.github.client-id}")
    private String githubClientId;

    @Value("${oauth2.github.client-secret}")
    private String githubClientSecret;

    public OAuthLoginResponse processOAuthLogin(OAuthLoginRequest request) {
        String provider = request.getProvider() != null ? request.getProvider().toUpperCase() : "GOOGLE";

        OAuthUserProfile userProfile;

        // Check if demo/preset mode is requested
        if (Boolean.TRUE.equals(request.getIsDemo()) || (request.getCode() != null && request.getCode().startsWith("demo-"))) {
            userProfile = resolveDemoProfile(provider, request);
        } else {
            // Real OAuth provider exchange
            if ("GOOGLE".equals(provider)) {
                userProfile = exchangeGoogleCode(request.getCode(), request.getRedirectUri());
            } else if ("GITHUB".equals(provider)) {
                userProfile = exchangeGitHubCode(request.getCode(), request.getRedirectUri());
            } else {
                throw new IllegalArgumentException("Unsupported OAuth provider: " + provider);
            }
        }

        // 1. Provision or find user in userservice
        log.info("Provisioning OAuth user in userservice: email={}, name={}, provider={}",
                userProfile.getEmail(), userProfile.getName(), userProfile.getProvider());

        UserInternalResponse userResponse = userClient.provisionOAuthUser(
                userProfile.getEmail(),
                userProfile.getName(),
                userProfile.getProvider()
        );

        UUID userId = userResponse.getUserId();

        // 2. Link or create credentials in authservice
        AuthUser authUser = authUserRepository.findById(userId).orElseGet(() -> {
            AuthUser newUser = new AuthUser();
            newUser.setUserId(userId);
            newUser.setAuthProvider(userProfile.getProvider());
            newUser.setProviderId(userProfile.getProviderId());

            Role userRole = roleRepository.findByRoleName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("ROLE_USER not found"));
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);
            newUser.setRoles(roles);

            return authUserRepository.save(newUser);
        });

        // Account linking if user was registered locally earlier
        if (authUser.getAuthProvider() == null || !authUser.getAuthProvider().equals(userProfile.getProvider())) {
            authUser.setAuthProvider(userProfile.getProvider());
            authUser.setProviderId(userProfile.getProviderId());
            authUserRepository.save(authUser);
        }

        // 3. Issue application JWT
        String token = jwtService.generateToken(authUser.getUserId(), authUser.getRoles());

        List<String> roleNames = authUser.getRoles().stream()
                .map(Role::getRoleName)
                .toList();

        return OAuthLoginResponse.builder()
                .token(token)
                .userId(userId)
                .email(userResponse.getEmail())
                .name(userResponse.getName() != null ? userResponse.getName() : userProfile.getName())
                .roles(roleNames)
                .provider(userProfile.getProvider())
                .build();
    }

    private OAuthUserProfile resolveDemoProfile(String provider, OAuthLoginRequest request) {
        if ("GITHUB".equals(provider)) {
            String email = request.getDemoEmail() != null && !request.getDemoEmail().isBlank()
                    ? request.getDemoEmail()
                    : "github.dev@ecommerce.demo";
            String name = request.getDemoName() != null && !request.getDemoName().isBlank()
                    ? request.getDemoName()
                    : "GitHub Developer";
            return OAuthUserProfile.builder()
                    .email(email)
                    .name(name)
                    .providerId("github-demo-" + UUID.nameUUIDFromBytes(email.getBytes()))
                    .provider("GITHUB")
                    .build();
        } else {
            String email = request.getDemoEmail() != null && !request.getDemoEmail().isBlank()
                    ? request.getDemoEmail()
                    : "google.user@ecommerce.demo";
            String name = request.getDemoName() != null && !request.getDemoName().isBlank()
                    ? request.getDemoName()
                    : "Google User";
            return OAuthUserProfile.builder()
                    .email(email)
                    .name(name)
                    .providerId("google-demo-" + UUID.nameUUIDFromBytes(email.getBytes()))
                    .provider("GOOGLE")
                    .build();
        }
    }

    private OAuthUserProfile exchangeGoogleCode(String code, String redirectUri) {
        try {
            // Step 1: Exchange code for tokens
            String tokenEndpoint = "https://oauth2.googleapis.com/token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("code", code);
            body.add("client_id", googleClientId);
            body.add("client_secret", googleClientSecret);
            body.add("redirect_uri", redirectUri != null ? redirectUri : "http://localhost:5173/oauth/callback");
            body.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> tokenResponse = restTemplate.postForEntity(tokenEndpoint, requestEntity, String.class);

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
            String accessToken = tokenJson.get("access_token").asText();

            // Step 2: Fetch user info
            String userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
            HttpHeaders authHeaders = new HttpHeaders();
            authHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userInfoEntity = new HttpEntity<>(authHeaders);

            ResponseEntity<String> userInfoResponse = restTemplate.exchange(
                    userInfoEndpoint, HttpMethod.GET, userInfoEntity, String.class);

            JsonNode userJson = objectMapper.readTree(userInfoResponse.getBody());

            return OAuthUserProfile.builder()
                    .email(userJson.path("email").asText())
                    .name(userJson.path("name").asText(userJson.path("email").asText().split("@")[0]))
                    .providerId(userJson.path("sub").asText())
                    .avatarUrl(userJson.path("picture").asText(null))
                    .provider("GOOGLE")
                    .build();
        } catch (Exception e) {
            log.error("Google OAuth token exchange failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage());
        }
    }

    private OAuthUserProfile exchangeGitHubCode(String code, String redirectUri) {
        try {
            // Step 1: Exchange code for access token
            String tokenEndpoint = "https://github.com/login/oauth/access_token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("code", code);
            body.add("client_id", githubClientId);
            body.add("client_secret", githubClientSecret);
            if (redirectUri != null) {
                body.add("redirect_uri", redirectUri);
            }

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> tokenResponse = restTemplate.postForEntity(tokenEndpoint, requestEntity, String.class);

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
            String accessToken = tokenJson.get("access_token").asText();

            // Step 2: Fetch GitHub profile
            HttpHeaders authHeaders = new HttpHeaders();
            authHeaders.setBearerAuth(accessToken);
            authHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));
            HttpEntity<Void> userEntity = new HttpEntity<>(authHeaders);

            ResponseEntity<String> userResponse = restTemplate.exchange(
                    "https://api.github.com/user", HttpMethod.GET, userEntity, String.class);

            JsonNode userJson = objectMapper.readTree(userResponse.getBody());
            String email = userJson.path("email").asText(null);

            // Step 3: If email is private on GitHub profile, query /user/emails
            if (email == null || email.isBlank() || "null".equals(email)) {
                try {
                    ResponseEntity<String> emailsResponse = restTemplate.exchange(
                            "https://api.github.com/user/emails", HttpMethod.GET, userEntity, String.class);
                    JsonNode emailsArray = objectMapper.readTree(emailsResponse.getBody());
                    if (emailsArray.isArray()) {
                        for (JsonNode emailNode : emailsArray) {
                            if (emailNode.path("primary").asBoolean(false)) {
                                email = emailNode.path("email").asText();
                                break;
                            }
                        }
                    }
                } catch (Exception ex) {
                    log.warn("Could not fetch private GitHub email: {}", ex.getMessage());
                }
            }

            if (email == null || email.isBlank() || "null".equals(email)) {
                email = userJson.path("login").asText() + "@users.noreply.github.com";
            }

            String name = userJson.path("name").asText(userJson.path("login").asText());

            return OAuthUserProfile.builder()
                    .email(email)
                    .name(name)
                    .providerId(userJson.path("id").asText())
                    .avatarUrl(userJson.path("avatar_url").asText(null))
                    .provider("GITHUB")
                    .build();
        } catch (Exception e) {
            log.error("GitHub OAuth token exchange failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to authenticate with GitHub: " + e.getMessage());
        }
    }
}
