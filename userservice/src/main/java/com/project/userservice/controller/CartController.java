package com.project.userservice.controller;

import com.project.userservice.dto.SyncCartRequestDTO;
import com.project.userservice.dto.UserCartItemDTO;
import com.project.userservice.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/internal/users/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<List<UserCartItemDTO>> getCart(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String paramUserId
    ) {
        String effectiveUserId = resolveUserId(headerUserId, paramUserId);
        if (effectiveUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cartService.getCart(UUID.fromString(effectiveUserId)));
    }

    @PutMapping
    public ResponseEntity<List<UserCartItemDTO>> syncCart(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String paramUserId,
            @RequestBody SyncCartRequestDTO request
    ) {
        String effectiveUserId = resolveUserId(headerUserId, paramUserId);
        if (effectiveUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(cartService.syncCart(UUID.fromString(effectiveUserId), request));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestParam(value = "userId", required = false) String paramUserId
    ) {
        String effectiveUserId = resolveUserId(headerUserId, paramUserId);
        if (effectiveUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        cartService.clearCart(UUID.fromString(effectiveUserId));
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(String headerUserId, String paramUserId) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            return headerUserId;
        }
        if (paramUserId != null && !paramUserId.isBlank()) {
            return paramUserId;
        }
        return null;
    }
}
