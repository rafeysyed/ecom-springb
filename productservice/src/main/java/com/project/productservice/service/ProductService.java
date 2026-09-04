package com.project.productservice.service;

import com.project.productservice.entity.Product;
import com.project.productservice.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    public List<Product> getSimilarProducts(UUID productId, int limit) {
        Product target = getProduct(productId);
        int pageSize = limit > 0 ? limit : 6;
        Pageable pageable = PageRequest.of(0, pageSize);

        List<Product> similar = new ArrayList<>(productRepository.findSimilarProducts(
                target.getId(),
                target.getCategory(),
                target.getRootCategory(),
                target.getBrand(),
                pageable
        ));

        // If fewer than pageSize results matched the category/brand/rootCategory criteria,
        // backfill with the top-rated products excluding target and already returned items
        if (similar.size() < pageSize) {
            int needed = pageSize - similar.size();
            List<UUID> excludeIds = new ArrayList<>();
            excludeIds.add(target.getId());
            for (Product p : similar) {
                excludeIds.add(p.getId());
            }
            List<Product> fallback = productRepository.findFallbackProducts(
                    excludeIds,
                    PageRequest.of(0, needed)
            );
            similar.addAll(fallback);
        }

        return similar;
    }
}

