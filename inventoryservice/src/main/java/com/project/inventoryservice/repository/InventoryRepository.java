package com.project.inventoryservice.repository;

import com.project.inventoryservice.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Optional<Inventory> findByProductId(UUID productId);

    List<Inventory> findAllByProductIdIn(Collection<UUID> productIds);

    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE Inventory i
        SET i.availableQuantity = i.availableQuantity - :qty,
            i.reservedQuantity = i.reservedQuantity + :qty
        WHERE i.productId = :productId
          AND i.availableQuantity >= :qty
    """)
    int reserveStock(@Param("productId") UUID productId, @Param("qty") int qty);

    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE Inventory i
        SET i.availableQuantity = i.availableQuantity + :qty,
            i.reservedQuantity = i.reservedQuantity - :qty
        WHERE i.productId = :productId
          AND i.reservedQuantity >= :qty
    """)
    int releaseStock(@Param("productId") UUID productId, @Param("qty") int qty);

    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE Inventory i
        SET i.reservedQuantity = i.reservedQuantity - :qty
        WHERE i.productId = :productId
          AND i.reservedQuantity >= :qty
    """)
    int commitStock(@Param("productId") UUID productId, @Param("qty") int qty);

    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE Inventory i
        SET i.availableQuantity = i.availableQuantity + :qty
        WHERE i.productId = :productId
    """)
    int restock(@Param("productId") UUID productId, @Param("qty") int qty);
}
