package com.project.userservice.service;

import com.project.userservice.dto.SyncCartRequestDTO;
import com.project.userservice.dto.UserCartItemDTO;
import com.project.userservice.entity.UserCartItem;
import com.project.userservice.repository.UserCartRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class CartService {

    private final UserCartRepository userCartRepository;

    public List<UserCartItemDTO> getCart(UUID userId) {
        List<UserCartItem> items = userCartRepository.findByUserId(userId);
        return items.stream()
                .map(item -> UserCartItemDTO.builder()
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .selectedSize(item.getSelectedSize())
                        .selectedColor(item.getSelectedColor())
                        .build())
                .toList();
    }

    @Transactional
    public List<UserCartItemDTO> syncCart(UUID userId, SyncCartRequestDTO request) {
        userCartRepository.deleteByUserId(userId);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            return List.of();
        }

        List<UserCartItem> newItems = request.getItems().stream()
                .filter(dto -> dto.getProductId() != null && dto.getQuantity() > 0)
                .map(dto -> UserCartItem.builder()
                        .userId(userId)
                        .productId(dto.getProductId())
                        .quantity(dto.getQuantity())
                        .selectedSize(dto.getSelectedSize())
                        .selectedColor(dto.getSelectedColor())
                        .build())
                .toList();

        List<UserCartItem> saved = userCartRepository.saveAll(newItems);
        log.info("Synchronized {} cart items for user {}", saved.size(), userId);

        return saved.stream()
                .map(item -> UserCartItemDTO.builder()
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .selectedSize(item.getSelectedSize())
                        .selectedColor(item.getSelectedColor())
                        .build())
                .toList();
    }

    @Transactional
    public void clearCart(UUID userId) {
        userCartRepository.deleteByUserId(userId);
        log.info("Cleared cart for user {}", userId);
    }
}
