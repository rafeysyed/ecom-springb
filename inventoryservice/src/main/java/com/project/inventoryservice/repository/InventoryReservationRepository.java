package com.project.inventoryservice.repository;

import com.project.inventoryservice.entity.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, UUID> {

    List<InventoryReservation> findByOrderId(UUID orderId);

    Optional<InventoryReservation> findByOrderIdAndProductId(UUID orderId, UUID productId);
}
