package com.project.recommendationservice.client;

import com.project.recommendationservice.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "productservice")
public interface ProductClient {

    @GetMapping("/products")
    List<ProductDTO> getAllProducts();

    @GetMapping("/products/{productId}")
    ProductDTO getProductById(@PathVariable("productId") UUID productId);
}
