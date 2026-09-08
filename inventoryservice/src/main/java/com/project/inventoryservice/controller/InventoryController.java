package com.project.inventoryservice.controller;

import com.project.inventoryservice.dto.*;
import com.project.inventoryservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponseDTO> getStock(@PathVariable UUID productId) {
        return ResponseEntity.ok(inventoryService.getStock(productId));
    }

    @PostMapping("/batch-check")
    public ResponseEntity<StockCheckResponseDTO> batchCheckStock(@RequestBody StockCheckRequestDTO request) {
        return ResponseEntity.ok(inventoryService.batchCheckStock(request));
    }

    @PostMapping("/reserve")
    public ResponseEntity<ReservationResponseDTO> reserveStock(@RequestBody ReservationRequestDTO request) {
        try {
            return ResponseEntity.ok(inventoryService.reserveStock(request));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ReservationResponseDTO.builder()
                            .orderId(request.getOrderId())
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @PostMapping("/commit")
    public ResponseEntity<ReservationResponseDTO> commitReservation(@RequestParam UUID orderId) {
        return ResponseEntity.ok(inventoryService.commitReservation(orderId));
    }

    @PostMapping("/release")
    public ResponseEntity<ReservationResponseDTO> releaseReservation(@RequestParam UUID orderId) {
        return ResponseEntity.ok(inventoryService.releaseReservation(orderId));
    }

    @PostMapping("/restock")
    public ResponseEntity<InventoryResponseDTO> restock(@RequestBody RestockRequestDTO request) {
        return ResponseEntity.ok(inventoryService.restock(request));
    }
}
