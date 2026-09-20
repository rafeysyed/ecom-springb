package com.project.recommendationservice.ml;

import com.project.recommendationservice.dto.ProductDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Slf4j
@Component
public class VectorEngine {

    private static final Pattern WORD_SPLIT = Pattern.compile("[\\s,;:.!?/()\\[\\]\"'-]+");
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with",
            "by", "from", "up", "about", "into", "over", "after", "is", "are", "was",
            "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
            "but", "if", "because", "as", "until", "while", "of", "it", "this",
            "that", "these", "those", "item", "product", "free", "shipping", "returns"
    );

    // Cached product vectors: productId -> Map<token, tfidfWeight>
    private final Map<UUID, Map<String, Double>> productVectors = new ConcurrentHashMap<>();
    private final Map<UUID, ProductDTO> productIndex = new ConcurrentHashMap<>();
    private final Map<String, Double> idfMap = new ConcurrentHashMap<>();

    public synchronized void trainIndex(List<ProductDTO> products) {
        if (products == null || products.isEmpty()) return;

        productIndex.clear();
        productVectors.clear();
        idfMap.clear();

        int docCount = products.size();
        Map<String, Integer> docFrequencies = new HashMap<>();

        // Step 1: Tokenize documents and count document frequencies
        Map<UUID, Map<String, Integer>> productTermCounts = new HashMap<>();

        for (ProductDTO product : products) {
            productIndex.put(product.getId(), product);
            List<String> tokens = extractTokens(product);
            Map<String, Integer> counts = new HashMap<>();
            Set<String> uniqueTokens = new HashSet<>(tokens);

            for (String t : tokens) {
                counts.put(t, counts.getOrDefault(t, 0) + 1);
            }
            productTermCounts.put(product.getId(), counts);

            for (String t : uniqueTokens) {
                docFrequencies.put(t, docFrequencies.getOrDefault(t, 0) + 1);
            }
        }

        // Step 2: Compute IDF for each term: idf = ln(1 + docCount / (1 + df))
        for (Map.Entry<String, Integer> entry : docFrequencies.entrySet()) {
            double idf = Math.log(1.0 + (double) docCount / (1.0 + entry.getValue()));
            idfMap.put(entry.getKey(), idf);
        }

        // Step 3: Compute normalized TF-IDF vector for each product
        for (Map.Entry<UUID, Map<String, Integer>> entry : productTermCounts.entrySet()) {
            UUID productId = entry.getKey();
            Map<String, Integer> termCounts = entry.getValue();

            int totalTerms = termCounts.values().stream().mapToInt(Integer::intValue).sum();
            Map<String, Double> vector = new HashMap<>();
            double sumSquares = 0.0;

            for (Map.Entry<String, Integer> tc : termCounts.entrySet()) {
                String term = tc.getKey();
                double tf = (double) tc.getValue() / Math.max(1, totalTerms);
                double idf = idfMap.getOrDefault(term, 1.0);
                double weight = tf * idf;
                vector.put(term, weight);
                sumSquares += weight * weight;
            }

            // Normalize vector to unit length
            double norm = Math.sqrt(sumSquares);
            if (norm > 0.0) {
                for (Map.Entry<String, Double> ve : vector.entrySet()) {
                    ve.setValue(ve.getValue() / norm);
                }
            }
            productVectors.put(productId, vector);
        }

        log.info("VectorEngine index built successfully with {} products and {} vocabulary terms.",
                productVectors.size(), idfMap.size());
    }

    public List<String> extractTokens(ProductDTO p) {
        List<String> tokens = new ArrayList<>();

        // Category and Root Category tokens (high weight - repeat 3 times)
        if (p.getRootCategory() != null) {
            addWeightedTokens(tokens, p.getRootCategory(), 3);
        }
        if (p.getCategory() != null) {
            addWeightedTokens(tokens, p.getCategory(), 3);
        }
        if (p.getBrand() != null) {
            addWeightedTokens(tokens, p.getBrand(), 2);
        }
        if (p.getName() != null) {
            addWeightedTokens(tokens, p.getName(), 1);
        }
        if (p.getDescription() != null) {
            addWeightedTokens(tokens, p.getDescription(), 1);
        }
        return tokens;
    }

    private void addWeightedTokens(List<String> destination, String text, int repetitions) {
        String[] words = WORD_SPLIT.split(text.toLowerCase(Locale.ROOT));
        for (String w : words) {
            if (w.length() >= 2 && !STOP_WORDS.contains(w)) {
                for (int i = 0; i < repetitions; i++) {
                    destination.add(w);
                }
            }
        }
    }

    public Map<String, Double> getProductVector(UUID productId) {
        return productVectors.get(productId);
    }

    public ProductDTO getProduct(UUID productId) {
        return productIndex.get(productId);
    }

    public List<ProductDTO> getAllIndexedProducts() {
        return new ArrayList<>(productIndex.values());
    }

    public double cosineSimilarity(Map<String, Double> vecA, Map<String, Double> vecB) {
        if (vecA == null || vecB == null || vecA.isEmpty() || vecB.isEmpty()) return 0.0;

        // Iterate over the smaller vector for speed
        Map<String, Double> smaller = vecA.size() < vecB.size() ? vecA : vecB;
        Map<String, Double> larger = vecA.size() < vecB.size() ? vecB : vecA;

        double dotProduct = 0.0;
        for (Map.Entry<String, Double> entry : smaller.entrySet()) {
            Double weightB = larger.get(entry.getKey());
            if (weightB != null) {
                dotProduct += entry.getValue() * weightB;
            }
        }
        return dotProduct;
    }
}
