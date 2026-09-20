package com.project.recommendationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponseDTO implements Serializable {
    private List<ProductDTO> products;
    private String strategy;
    private String title;
    private String description;
}
