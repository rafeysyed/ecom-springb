package com.project.recommendationservice.ml;

import com.project.recommendationservice.dto.ProductDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class VectorEngineTest {

    private VectorEngine vectorEngine;

    @BeforeEach
    void setUp() {
        vectorEngine = new VectorEngine();
    }

    @Test
    @DisplayName("extractTokens: should remove punctuation, stop words, and apply domain weighting")
    void extractTokens_ShouldFilterStopWordsAndWeightAttributes() {
        ProductDTO product = ProductDTO.builder()
                .id(UUID.randomUUID())
                .name("Air Zoom Pegasus")
                .brand("Nike")
                .category("Running Shoes")
                .rootCategory("Footwear")
                .description("Lightweight running shoe with responsive foam and free delivery.")
                .price(BigDecimal.valueOf(130.0))
                .inStock(true)
                .build();

        List<String> tokens = vectorEngine.extractTokens(product);

        // Assert tokens contain keywords
        assertTrue(tokens.contains("nike"));
        assertTrue(tokens.contains("running"));
        assertTrue(tokens.contains("shoes"));
        assertTrue(tokens.contains("footwear"));
        assertTrue(tokens.contains("pegasus"));

        // Assert stop words are filtered out
        assertFalse(tokens.contains("with"));
        assertFalse(tokens.contains("and"));
        assertFalse(tokens.contains("free"));

        // High priority attributes (category, rootCategory) should have multiple weighted occurrences
        long categoryTokenCount = tokens.stream().filter(t -> t.equals("running")).count();
        assertTrue(categoryTokenCount >= 3, "Category tokens should have higher repetition weighting");
    }

    @Test
    @DisplayName("trainIndex: should compute normalized TF-IDF vectors for catalog items")
    void trainIndex_ShouldBuildUnitVectorsForProducts() {
        UUID id1 = UUID.randomUUID();
        ProductDTO p1 = ProductDTO.builder()
                .id(id1)
                .name("Nike Air Zoom")
                .brand("Nike")
                .category("Running Shoes")
                .rootCategory("Footwear")
                .price(BigDecimal.valueOf(120.0))
                .inStock(true)
                .build();

        UUID id2 = UUID.randomUUID();
        ProductDTO p2 = ProductDTO.builder()
                .id(id2)
                .name("Gold Pendant Necklace")
                .brand("Unbeatablesale")
                .category("Pendant Necklaces")
                .rootCategory("Jewelry")
                .price(BigDecimal.valueOf(45.0))
                .inStock(true)
                .build();

        vectorEngine.trainIndex(List.of(p1, p2));

        assertEquals(2, vectorEngine.getAllIndexedProducts().size());
        assertEquals(p1, vectorEngine.getProduct(id1));

        Map<String, Double> vec1 = vectorEngine.getProductVector(id1);
        assertNotNull(vec1);
        assertFalse(vec1.isEmpty());
        assertTrue(vec1.containsKey("nike"));

        // Vector length should be approximately 1.0 (unit vector)
        double norm = Math.sqrt(vec1.values().stream().mapToDouble(w -> w * w).sum());
        assertEquals(1.0, norm, 0.001, "Normalized TF-IDF vector must have magnitude close to 1.0");
    }

    @Test
    @DisplayName("cosineSimilarity: should calculate high similarity for identical/related products and low for unrelated")
    void cosineSimilarity_ShouldDifferentiateRelatedVsUnrelated() {
        UUID idShoes1 = UUID.randomUUID();
        ProductDTO shoes1 = ProductDTO.builder()
                .id(idShoes1)
                .name("Nike Air Zoom Running")
                .brand("Nike")
                .category("Running Shoes")
                .rootCategory("Footwear")
                .price(BigDecimal.valueOf(130.0))
                .inStock(true)
                .build();

        UUID idShoes2 = UUID.randomUUID();
        ProductDTO shoes2 = ProductDTO.builder()
                .id(idShoes2)
                .name("Nike Flex Experience Running Shoe")
                .brand("Nike")
                .category("Running Shoes")
                .rootCategory("Footwear")
                .price(BigDecimal.valueOf(95.0))
                .inStock(true)
                .build();

        UUID idJewelry = UUID.randomUUID();
        ProductDTO jewelry = ProductDTO.builder()
                .id(idJewelry)
                .name("Rose Gold Diamond Pendant Necklace")
                .brand("SHEIN")
                .category("Women Necklaces")
                .rootCategory("Jewelry")
                .price(BigDecimal.valueOf(25.0))
                .inStock(true)
                .build();

        vectorEngine.trainIndex(List.of(shoes1, shoes2, jewelry));

        Map<String, Double> vecShoes1 = vectorEngine.getProductVector(idShoes1);
        Map<String, Double> vecShoes2 = vectorEngine.getProductVector(idShoes2);
        Map<String, Double> vecJewelry = vectorEngine.getProductVector(idJewelry);

        double similarityShoes = vectorEngine.cosineSimilarity(vecShoes1, vecShoes2);
        double similarityCross = vectorEngine.cosineSimilarity(vecShoes1, vecJewelry);

        assertTrue(similarityShoes > 0.6, "Shoes sharing Nike, Running, Footwear must have high similarity");
        assertTrue(similarityCross < 0.1, "Shoes vs Jewelry must have near-zero similarity");
        assertTrue(similarityShoes > similarityCross);
    }
}
