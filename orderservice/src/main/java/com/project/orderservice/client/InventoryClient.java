package com.project.orderservice.client;

import com.project.orderservice.dto.inventory.InventoryReservationRequest;
import com.project.orderservice.dto.inventory.InventoryReservationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "inventoryservice")
public interface InventoryClient {

    @PostMapping("/inventory/reserve")
    InventoryReservationResponse reserveStock(@RequestBody InventoryReservationRequest request);

    @PostMapping("/inventory/commit")
    InventoryReservationResponse commitReservation(@RequestParam("orderId") UUID orderId);

    @PostMapping("/inventory/release")
    InventoryReservationResponse releaseReservation(@RequestParam("orderId") UUID orderId);
}
