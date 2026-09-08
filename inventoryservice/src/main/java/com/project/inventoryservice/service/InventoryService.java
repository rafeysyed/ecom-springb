package com.project.inventoryservice.service;

import com.project.inventoryservice.dto.*;
import com.project.inventoryservice.entity.Inventory;
import com.project.inventoryservice.entity.InventoryReservation;
import com.project.inventoryservice.entity.ReservationStatus;
import com.project.inventoryservice.repository.InventoryRepository;
import com.project.inventoryservice.repository.InventoryReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public InventoryResponseDTO getStock(UUID productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElse(Inventory.builder()
                        .productId(productId)
                        .availableQuantity(0)
                        .reservedQuantity(0)
                        .lowStockThreshold(5)
                        .build());

        return InventoryResponseDTO.builder()
                .productId(productId)
                .availableQuantity(inventory.getAvailableQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .inStock(inventory.getAvailableQuantity() > 0)
                .isLowStock(inventory.getAvailableQuantity() > 0 && inventory.getAvailableQuantity() <= inventory.getLowStockThreshold())
                .build();
    }

    @Transactional(readOnly = true)
    public StockCheckResponseDTO batchCheckStock(StockCheckRequestDTO request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            return StockCheckResponseDTO.builder()
                    .allInStock(true)
                    .outOfStockProductIds(Collections.emptyList())
                    .message("No items provided")
                    .build();
        }

        List<UUID> productIds = request.getItems().stream()
                .map(ReservationItemDTO::getProductId)
                .filter(Objects::nonNull)
                .toList();

        Map<UUID, Inventory> inventoryMap = new HashMap<>();
        for (Inventory inv : inventoryRepository.findAllByProductIdIn(productIds)) {
            inventoryMap.put(inv.getProductId(), inv);
        }

        List<UUID> outOfStockIds = new ArrayList<>();
        for (ReservationItemDTO item : request.getItems()) {
            Inventory inv = inventoryMap.get(item.getProductId());
            int available = (inv != null && inv.getAvailableQuantity() != null) ? inv.getAvailableQuantity() : 0;
            int requested = (item.getQuantity() != null && item.getQuantity() > 0) ? item.getQuantity() : 1;

            if (available < requested) {
                outOfStockIds.add(item.getProductId());
            }
        }

        boolean allInStock = outOfStockIds.isEmpty();
        return StockCheckResponseDTO.builder()
                .allInStock(allInStock)
                .outOfStockProductIds(outOfStockIds)
                .message(allInStock ? "All items in stock" : "Some items are out of stock")
                .build();
    }

    @Transactional
    public ReservationResponseDTO reserveStock(ReservationRequestDTO request) {
        UUID orderId = request.getOrderId();
        log.info("Attempting to reserve inventory for orderId: {}", orderId);

        // Idempotency: Check if already reserved
        List<InventoryReservation> existing = reservationRepository.findByOrderId(orderId);
        if (!existing.isEmpty()) {
            ReservationStatus currentStatus = existing.get(0).getStatus();
            if (currentStatus == ReservationStatus.RESERVED || currentStatus == ReservationStatus.COMMITTED) {
                return ReservationResponseDTO.builder()
                        .orderId(orderId)
                        .success(true)
                        .status(currentStatus)
                        .message("Order already has active reservation: " + currentStatus)
                        .build();
            }
        }

        // Try atomic reservation for all items
        for (ReservationItemDTO item : request.getItems()) {
            int qty = (item.getQuantity() != null && item.getQuantity() > 0) ? item.getQuantity() : 1;
            int updated = inventoryRepository.reserveStock(item.getProductId(), qty);

            if (updated == 0) {
                log.warn("Failed to reserve product {}: insufficient stock", item.getProductId());
                throw new IllegalStateException("Insufficient stock for product: " + item.getProductId());
            }

            InventoryReservation reservation = InventoryReservation.builder()
                    .orderId(orderId)
                    .productId(item.getProductId())
                    .quantity(qty)
                    .status(ReservationStatus.RESERVED)
                    .build();

            reservationRepository.save(reservation);
        }

        log.info("Successfully reserved stock for orderId: {}", orderId);
        return ReservationResponseDTO.builder()
                .orderId(orderId)
                .success(true)
                .status(ReservationStatus.RESERVED)
                .message("Successfully reserved stock")
                .build();
    }

    @Transactional
    public ReservationResponseDTO commitReservation(UUID orderId) {
        log.info("Committing reservations for orderId: {}", orderId);
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(orderId);

        if (reservations.isEmpty()) {
            return ReservationResponseDTO.builder()
                    .orderId(orderId)
                    .success(false)
                    .message("No reservations found for orderId: " + orderId)
                    .build();
        }

        for (InventoryReservation res : reservations) {
            if (res.getStatus() == ReservationStatus.RESERVED) {
                inventoryRepository.commitStock(res.getProductId(), res.getQuantity());
                res.setStatus(ReservationStatus.COMMITTED);
                reservationRepository.save(res);
            }
        }

        return ReservationResponseDTO.builder()
                .orderId(orderId)
                .success(true)
                .status(ReservationStatus.COMMITTED)
                .message("Committed reservations for orderId: " + orderId)
                .build();
    }

    @Transactional
    public ReservationResponseDTO releaseReservation(UUID orderId) {
        log.info("Releasing/Restocking reservations for orderId: {}", orderId);
        List<InventoryReservation> reservations = reservationRepository.findByOrderId(orderId);

        if (reservations.isEmpty()) {
            return ReservationResponseDTO.builder()
                    .orderId(orderId)
                    .success(false)
                    .message("No reservations found for orderId: " + orderId)
                    .build();
        }

        for (InventoryReservation res : reservations) {
            if (res.getStatus() == ReservationStatus.RESERVED) {
                // Was on hold during checkout -> release back to available
                inventoryRepository.releaseStock(res.getProductId(), res.getQuantity());
                res.setStatus(ReservationStatus.RELEASED);
                reservationRepository.save(res);
            } else if (res.getStatus() == ReservationStatus.COMMITTED) {
                // Was fully bought, now cancelled post-purchase -> restock
                inventoryRepository.restock(res.getProductId(), res.getQuantity());
                res.setStatus(ReservationStatus.RESTOCKED);
                reservationRepository.save(res);
            }
        }

        return ReservationResponseDTO.builder()
                .orderId(orderId)
                .success(true)
                .status(ReservationStatus.RELEASED)
                .message("Released/Restocked reservations for orderId: " + orderId)
                .build();
    }

    @Transactional
    public InventoryResponseDTO restock(RestockRequestDTO request) {
        UUID productId = request.getProductId();
        int qty = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 0;

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> Inventory.builder()
                        .productId(productId)
                        .availableQuantity(0)
                        .reservedQuantity(0)
                        .lowStockThreshold(5)
                        .build());

        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + qty);
        Inventory saved = inventoryRepository.save(inventory);

        return InventoryResponseDTO.builder()
                .productId(productId)
                .availableQuantity(saved.getAvailableQuantity())
                .reservedQuantity(saved.getReservedQuantity())
                .inStock(saved.getAvailableQuantity() > 0)
                .isLowStock(saved.getAvailableQuantity() > 0 && saved.getAvailableQuantity() <= saved.getLowStockThreshold())
                .build();
    }
}
