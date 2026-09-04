package com.project.productservice.repository;

import com.project.productservice.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Query("""
        SELECT p FROM Product p
        WHERE p.id != :targetId
          AND (
            (:category IS NOT NULL AND p.category = :category)
            OR (:rootCategory IS NOT NULL AND p.rootCategory = :rootCategory)
            OR (:brand IS NOT NULL AND p.brand = :brand)
          )
        ORDER BY
          (CASE WHEN :category IS NOT NULL AND p.category = :category THEN 3 ELSE 0 END +
           CASE WHEN :brand IS NOT NULL AND p.brand = :brand THEN 2 ELSE 0 END +
           CASE WHEN :rootCategory IS NOT NULL AND p.rootCategory = :rootCategory THEN 1 ELSE 0 END) DESC,
          CASE WHEN p.inStock = true THEN 1 ELSE 0 END DESC,
          COALESCE(p.rating, 0.0) DESC
    """)
    List<Product> findSimilarProducts(
        @Param("targetId") UUID targetId,
        @Param("category") String category,
        @Param("rootCategory") String rootCategory,
        @Param("brand") String brand,
        Pageable pageable
    );

    @Query("""
        SELECT p FROM Product p
        WHERE p.id NOT IN :excludeIds
        ORDER BY
          CASE WHEN p.inStock = true THEN 1 ELSE 0 END DESC,
          COALESCE(p.rating, 0.0) DESC
    """)
    List<Product> findFallbackProducts(
        @Param("excludeIds") Collection<UUID> excludeIds,
        Pageable pageable
    );
}

