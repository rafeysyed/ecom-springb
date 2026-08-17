package com.project.productservice.service;

import com.project.productservice.entity.Product;
import com.project.productservice.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product createProduct(Product product){
        return productRepository.save(product);
    }

    public Product getProduct(UUID productId){
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException(
                        "Product not found with this id: "+productId));
    }

    public List<Product> getAllProducts(){
        return productRepository.findAll();
    }
}
