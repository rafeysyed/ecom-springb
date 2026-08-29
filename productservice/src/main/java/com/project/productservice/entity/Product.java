package com.project.productservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "products")
public class Product implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false, length = 1000)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "initial_price", precision = 12, scale = 2)
    private BigDecimal initialPrice;

    private String currency;

    @Column(name = "in_stock")
    private Boolean inStock;

    private String color;

    private String size;

    @Column(name = "all_available_sizes", columnDefinition = "TEXT")
    private String allAvailableSizes;

    @Column(name = "main_image", columnDefinition = "TEXT")
    private String mainImage;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    private Double rating;

    @Column(name = "reviews_count")
    private Integer reviewsCount;

    private String brand;

    private String category;

    @Column(name = "root_category")
    private String rootCategory;

    private String sku;

    @Column(columnDefinition = "TEXT")
    private String url;
}
