package com.project.recommendationservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductDTO implements Serializable {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String currency;
    private boolean inStock;
    private String category;
    private String rootCategory;
    private String brand;
    private double rating;
    private int reviewsCount;
    private String mainImage;
}
