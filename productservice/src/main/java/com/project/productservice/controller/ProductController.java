package com.project.productservice.controller;

import com.project.productservice.entity.Product;
import com.project.productservice.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @CacheEvict(value = "products", allEntries = true) //applicable to delete and update, cache must clear
    @PostMapping
    public Product createProduct(@RequestBody Product product){
        return productService.createProduct(product);
    }


    @Cacheable(value = "products")
    @GetMapping("/{productId}")
    public Product getProduct(@PathVariable UUID productId){
        return productService.getProduct(productId);
    }

    @Cacheable(value = "products")
    @GetMapping
    public List<Product> getAllProducts(){

        System.out.println("Fetching from DB...");
        return productService.getAllProducts();
    }
}
