package com.project.productservice.service;

import com.project.productservice.entity.Product;
import com.project.productservice.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;
    private UUID sampleId;

    @BeforeEach
    void setUp() {
        sampleId = UUID.randomUUID();
        sampleProduct = new Product();
        sampleProduct.setId(sampleId);
        sampleProduct.setName("Nike Air Zoom Pegasus");
        sampleProduct.setBrand("Nike");
        sampleProduct.setCategory("Running Shoes");
        sampleProduct.setRootCategory("Footwear");
        sampleProduct.setPrice(BigDecimal.valueOf(129.99));
        sampleProduct.setInStock(true);
        sampleProduct.setRating(4.8);
    }

    @Test
    @DisplayName("getProduct: should return product when found by ID")
    void getProduct_WhenProductExists_ShouldReturnProduct() {
        when(productRepository.findById(sampleId)).thenReturn(Optional.of(sampleProduct));

        Product result = productService.getProduct(sampleId);

        assertNotNull(result);
        assertEquals(sampleId, result.getId());
        assertEquals("Nike Air Zoom Pegasus", result.getName());
        assertEquals("Nike", result.getBrand());
        verify(productRepository, times(1)).findById(sampleId);
    }

    @Test
    @DisplayName("getProduct: should throw RuntimeException when product ID does not exist")
    void getProduct_WhenNotFound_ShouldThrowException() {
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                productService.getProduct(nonExistentId)
        );

        assertTrue(exception.getMessage().contains("Product not found with this id"));
    }

    @Test
    @DisplayName("createProduct: should save and return new product")
    void createProduct_ShouldSaveProduct() {
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        Product saved = productService.createProduct(sampleProduct);

        assertNotNull(saved);
        assertEquals(sampleId, saved.getId());
        verify(productRepository, times(1)).save(sampleProduct);
    }

    @Test
    @DisplayName("getAllProducts: should return all catalog items")
    void getAllProducts_ShouldReturnCatalogList() {
        List<Product> products = List.of(sampleProduct);
        when(productRepository.findAll()).thenReturn(products);

        List<Product> result = productService.getAllProducts();

        assertEquals(1, result.size());
        assertEquals(sampleProduct, result.get(0));
        verify(productRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getSimilarProducts: should return similar products and backfill when fewer than limit")
    void getSimilarProducts_ShouldReturnMatchesAndBackfillIfNeeded() {
        when(productRepository.findById(sampleId)).thenReturn(Optional.of(sampleProduct));

        Product similar1 = new Product();
        similar1.setId(UUID.randomUUID());
        similar1.setName("Nike Flex Experience");
        similar1.setBrand("Nike");
        similar1.setCategory("Running Shoes");
        similar1.setRootCategory("Footwear");
        similar1.setPrice(BigDecimal.valueOf(89.99));
        similar1.setInStock(true);

        Product fallbackProduct = new Product();
        fallbackProduct.setId(UUID.randomUUID());
        fallbackProduct.setName("Top Rated Athletic Trainer");
        fallbackProduct.setBrand("Asics");
        fallbackProduct.setCategory("Running Shoes");
        fallbackProduct.setPrice(BigDecimal.valueOf(110.0));
        fallbackProduct.setInStock(true);

        // findSimilarProducts returns 1 item, but limit is 2
        when(productRepository.findSimilarProducts(
                eq(sampleId), eq(sampleProduct.getCategory()), eq(sampleProduct.getRootCategory()), eq(sampleProduct.getBrand()), any(Pageable.class)
        )).thenReturn(List.of(similar1));

        // Fallback returns 1 item to satisfy limit 2
        when(productRepository.findFallbackProducts(anyCollection(), any(Pageable.class)))
                .thenReturn(List.of(fallbackProduct));

        List<Product> result = productService.getSimilarProducts(sampleId, 2);

        assertEquals(2, result.size());
        assertEquals(similar1, result.get(0));
        assertEquals(fallbackProduct, result.get(1));
        verify(productRepository, times(1)).findFallbackProducts(anyCollection(), any(Pageable.class));
    }
}
