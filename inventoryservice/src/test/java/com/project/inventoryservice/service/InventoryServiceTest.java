package com.project.inventoryservice.service;

import com.project.inventoryservice.dto.*;
import com.project.inventoryservice.entity.Inventory;
import com.project.inventoryservice.entity.InventoryReservation;
import com.project.inventoryservice.entity.ReservationStatus;
import com.project.inventoryservice.repository.InventoryRepository;
import com.project.inventoryservice.repository.InventoryReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryReservationRepository reservationRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private UUID sampleProductId;
    private Inventory sampleInventory;

    @BeforeEach
    void setUp() {
        sampleProductId = UUID.randomUUID();
        sampleInventory = Inventory.builder()
                .id(UUID.randomUUID())
                .productId(sampleProductId)
                .availableQuantity(25)
                .reservedQuantity(5)
                .lowStockThreshold(5)
                .build();
    }

    @Test
    @DisplayName("getStock: should return inventory details when found")
    void getStock_WhenFound_ShouldReturnDetails() {
        when(inventoryRepository.findByProductId(sampleProductId)).thenReturn(Optional.of(sampleInventory));

        InventoryResponseDTO response = inventoryService.getStock(sampleProductId);

        assertNotNull(response);
        assertEquals(sampleProductId, response.getProductId());
        assertEquals(25, response.getAvailableQuantity());
        assertEquals(5, response.getReservedQuantity());
        assertTrue(response.getInStock());
        assertFalse(response.getIsLowStock());
        verify(inventoryRepository, times(1)).findByProductId(sampleProductId);
    }

    @Test
    @DisplayName("getStock: should return 0 stock when product has no inventory record")
    void getStock_WhenNotFound_ShouldReturnDefaultZero() {
        UUID unknownProductId = UUID.randomUUID();
        when(inventoryRepository.findByProductId(unknownProductId)).thenReturn(Optional.empty());

        InventoryResponseDTO response = inventoryService.getStock(unknownProductId);

        assertNotNull(response);
        assertEquals(unknownProductId, response.getProductId());
        assertEquals(0, response.getAvailableQuantity());
        assertFalse(response.getInStock());
    }

    @Test
    @DisplayName("batchCheckStock: should return allInStock=true when all items have sufficient quantity")
    void batchCheckStock_WhenAllAvailable_ShouldReturnTrue() {
        ReservationItemDTO item = new ReservationItemDTO(sampleProductId, 2);
        StockCheckRequestDTO request = new StockCheckRequestDTO(List.of(item));

        when(inventoryRepository.findAllByProductIdIn(anyList())).thenReturn(List.of(sampleInventory));

        StockCheckResponseDTO response = inventoryService.batchCheckStock(request);

        assertNotNull(response);
        assertTrue(response.getAllInStock());
        assertTrue(response.getOutOfStockProductIds().isEmpty());
    }

    @Test
    @DisplayName("batchCheckStock: should identify out-of-stock items when requested quantity exceeds available")
    void batchCheckStock_WhenQuantityExceedsAvailable_ShouldFlagOutOfStock() {
        ReservationItemDTO item = new ReservationItemDTO(sampleProductId, 50); // available is only 25
        StockCheckRequestDTO request = new StockCheckRequestDTO(List.of(item));

        when(inventoryRepository.findAllByProductIdIn(anyList())).thenReturn(List.of(sampleInventory));

        StockCheckResponseDTO response = inventoryService.batchCheckStock(request);

        assertNotNull(response);
        assertFalse(response.getAllInStock());
        assertEquals(1, response.getOutOfStockProductIds().size());
        assertEquals(sampleProductId, response.getOutOfStockProductIds().get(0));
    }

    @Test
    @DisplayName("reserveStock: should throw IllegalStateException when reserveStock returns 0 updated rows")
    void reserveStock_WhenInsufficientStock_ShouldThrowException() {
        UUID orderId = UUID.randomUUID();
        ReservationItemDTO item = new ReservationItemDTO(sampleProductId, 5);
        ReservationRequestDTO request = new ReservationRequestDTO(orderId, List.of(item));

        when(reservationRepository.findByOrderId(orderId)).thenReturn(Collections.emptyList());
        when(inventoryRepository.reserveStock(sampleProductId, 5)).thenReturn(0); // 0 rows updated = failure

        assertThrows(IllegalStateException.class, () -> inventoryService.reserveStock(request));
    }
}
