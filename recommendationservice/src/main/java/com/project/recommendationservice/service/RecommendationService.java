package com.project.recommendationservice.service;

import com.project.recommendationservice.client.ProductClient;
import com.project.recommendationservice.dto.ProductDTO;
import com.project.recommendationservice.dto.RecommendationResponseDTO;
import com.project.recommendationservice.dto.UserInteractionEvent;
import com.project.recommendationservice.ml.CollaborativeFilter;
import com.project.recommendationservice.ml.VectorEngine;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final String REDIS_REC_PREFIX = "user:rec:";
    private static final String REDIS_HISTORY_PREFIX = "user:history:";

    private final VectorEngine vectorEngine;
    private final CollaborativeFilter collaborativeFilter;
    private final ProductClient productClient;
    private final RedisTemplate<String, Object> redisTemplate;

    // In-memory fallback history: userId -> List of interaction events
    private final Map<UUID, List<UserInteractionEvent>> inMemoryUserHistory = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        refreshCatalogIndex();
    }

    @Scheduled(fixedRate = 600000) // Refresh every 10 minutes
    public void scheduledIndexRefresh() {
        refreshCatalogIndex();
    }

    public void refreshCatalogIndex() {
        try {
            log.info("Fetching products from productservice for ML vector indexing...");
            List<ProductDTO> products = productClient.getAllProducts();
            if (products != null && !products.isEmpty()) {
                vectorEngine.trainIndex(products);
                log.info("Product catalog index successfully trained with {} items.", products.size());
            } else {
                log.warn("No products returned from productservice during index refresh.");
            }
        } catch (Exception e) {
            log.error("Failed to fetch products for ML index training: {}", e.getMessage());
        }
    }

    public void recordInteraction(UserInteractionEvent event) {
        if (event.getUserId() == null || event.getProductId() == null) return;

        if (event.getTimestamp() == null) {
            event.setTimestamp(Instant.now());
        }

        // Store in user history
        List<UserInteractionEvent> history = inMemoryUserHistory.computeIfAbsent(
                event.getUserId(), k -> Collections.synchronizedList(new ArrayList<>())
        );

        // Record collaborative pairs with recent interactions
        synchronized (history) {
            int lookback = Math.max(0, history.size() - 5);
            for (int i = history.size() - 1; i >= lookback; i--) {
                collaborativeFilter.recordInteractionPair(event.getProductId(), history.get(i).getProductId());
            }
            history.add(event);
        }

        // Invalidate user recommendation cache in Redis so next query produces fresh ML recommendations
        try {
            redisTemplate.delete(REDIS_REC_PREFIX + event.getUserId());
        } catch (Exception e) {
            log.warn("Redis delete error for user {}: {}", event.getUserId(), e.getMessage());
        }

        log.info("Recorded interaction: user={}, product={}, type={}",
                event.getUserId(), event.getProductId(), event.getEventType());
    }

    public RecommendationResponseDTO getPersonalizedRecommendations(UUID userId, int limit) {
        int targetLimit = Math.max(1, limit);

        // 1. If authenticated, check Redis cache first
        if (userId != null) {
            try {
                Object cached = redisTemplate.opsForValue().get(REDIS_REC_PREFIX + userId);
                if (cached instanceof RecommendationResponseDTO responseDTO) {
                    log.debug("Serving recommendations for user {} from Redis cache", userId);
                    return responseDTO;
                }
            } catch (Exception e) {
                log.warn("Redis lookup error: {}", e.getMessage());
            }
        }

        // 2. Fetch user interactions
        List<UserInteractionEvent> history = (userId != null)
                ? inMemoryUserHistory.getOrDefault(userId, Collections.emptyList())
                : Collections.emptyList();

        RecommendationResponseDTO result;

        if (!history.isEmpty()) {
            result = computePersonalizedFromHistory(userId, history, targetLimit);
        } else {
            result = computeColdStartRecommendations(targetLimit);
        }

        // 3. Cache personalized result in Redis (TTL: 30 minutes)
        if (userId != null && result != null) {
            try {
                redisTemplate.opsForValue().set(
                        REDIS_REC_PREFIX + userId,
                        result,
                        Duration.ofMinutes(30)
                );
            } catch (Exception e) {
                log.warn("Redis cache write error: {}", e.getMessage());
            }
        }

        return result;
    }

    private RecommendationResponseDTO computePersonalizedFromHistory(
            UUID userId,
            List<UserInteractionEvent> history,
            int limit
    ) {
        // Build weighted User Profile Vector
        Map<String, Double> userVector = new HashMap<>();
        Set<UUID> purchasedProductIds = new HashSet<>();
        Set<UUID> interactedProductIds = new HashSet<>();

        synchronized (history) {
            for (UserInteractionEvent ev : history) {
                interactedProductIds.add(ev.getProductId());
                if ("PURCHASE".equalsIgnoreCase(ev.getEventType())) {
                    purchasedProductIds.add(ev.getProductId());
                }

                double eventWeight = switch (ev.getEventType().toUpperCase()) {
                    case "PURCHASE" -> 5.0;
                    case "CART_ADD" -> 2.5;
                    default -> 1.0; // VIEW
                };

                Map<String, Double> pVec = vectorEngine.getProductVector(ev.getProductId());
                if (pVec != null) {
                    for (Map.Entry<String, Double> entry : pVec.entrySet()) {
                        userVector.merge(entry.getKey(), entry.getValue() * eventWeight, Double::sum);
                    }
                }
            }
        }

        // Normalize User Vector
        double sumSq = userVector.values().stream().mapToDouble(v -> v * v).sum();
        double norm = Math.sqrt(sumSq);
        if (norm > 0.0) {
            for (Map.Entry<String, Double> entry : userVector.entrySet()) {
                entry.setValue(entry.getValue() / norm);
            }
        }

        // Score all available products
        List<ProductDTO> allProducts = vectorEngine.getAllIndexedProducts();
        List<ScoredProduct> scored = new ArrayList<>();

        for (ProductDTO product : allProducts) {
            if (!product.isInStock() || purchasedProductIds.contains(product.getId())) {
                continue; // Skip out of stock or already bought items
            }

            Map<String, Double> pVec = vectorEngine.getProductVector(product.getId());
            double sim = vectorEngine.cosineSimilarity(userVector, pVec);

            // Small boost for high ratings
            double finalScore = sim * (1.0 + (product.getRating() * 0.05));

            // Slight penalty if already viewed to promote fresh discovery
            if (interactedProductIds.contains(product.getId())) {
                finalScore *= 0.85;
            }

            if (finalScore > 0.01) {
                scored.add(new ScoredProduct(product, finalScore));
            }
        }

        scored.sort(Comparator.comparingDouble(ScoredProduct::score).reversed());

        List<ProductDTO> recommended = new ArrayList<>();
        for (ScoredProduct sp : scored) {
            recommended.add(sp.product());
            if (recommended.size() >= limit) break;
        }

        // Fallback fill if not enough items
        if (recommended.size() < limit) {
            for (ProductDTO p : allProducts) {
                if (p.isInStock() && !purchasedProductIds.contains(p.getId()) && !recommended.contains(p)) {
                    recommended.add(p);
                    if (recommended.size() >= limit) break;
                }
            }
        }

        return RecommendationResponseDTO.builder()
                .products(recommended)
                .strategy("PERSONALIZED_VECTOR_SIMILARITY")
                .title("Recommended For You")
                .description("Curated based on your browsing, cart, and shopping interests")
                .build();
    }

    private RecommendationResponseDTO computeColdStartRecommendations(int limit) {
        List<ProductDTO> allProducts = vectorEngine.getAllIndexedProducts();

        // Sort by rating descending and popularity
        List<ProductDTO> trending = allProducts.stream()
                .filter(ProductDTO::isInStock)
                .sorted(Comparator.comparingDouble(ProductDTO::getRating).reversed()
                        .thenComparingInt(ProductDTO::getReviewsCount).reversed())
                .limit(limit)
                .toList();

        return RecommendationResponseDTO.builder()
                .products(trending)
                .strategy("COLD_START_TRENDING")
                .title("Trending & Top Rated")
                .description("Popular items chosen by shoppers")
                .build();
    }

    public RecommendationResponseDTO getFrequentlyBoughtTogether(UUID productId, int limit) {
        int targetLimit = Math.max(1, limit);
        List<ProductDTO> recommendations = new ArrayList<>();

        // 1. Try Collaborative Filtering
        List<UUID> correlatedIds = collaborativeFilter.getTopCorrelatedItems(productId, targetLimit);
        for (UUID cid : correlatedIds) {
            ProductDTO p = vectorEngine.getProduct(cid);
            if (p != null && p.isInStock() && !p.getId().equals(productId)) {
                recommendations.add(p);
            }
        }

        // 2. If not enough collaborative pairs, use vector content similarity
        if (recommendations.size() < targetLimit) {
            Map<String, Double> targetVec = vectorEngine.getProductVector(productId);
            if (targetVec != null) {
                List<ProductDTO> all = vectorEngine.getAllIndexedProducts();
                List<ScoredProduct> scored = new ArrayList<>();

                for (ProductDTO p : all) {
                    if (p.getId().equals(productId) || !p.isInStock() || recommendations.contains(p)) {
                        continue;
                    }
                    Map<String, Double> pVec = vectorEngine.getProductVector(p.getId());
                    double sim = vectorEngine.cosineSimilarity(targetVec, pVec);
                    if (sim > 0.05) {
                        scored.add(new ScoredProduct(p, sim));
                    }
                }

                scored.sort(Comparator.comparingDouble(ScoredProduct::score).reversed());
                for (ScoredProduct sp : scored) {
                    recommendations.add(sp.product());
                    if (recommendations.size() >= targetLimit) break;
                }
            }
        }

        return RecommendationResponseDTO.builder()
                .products(recommendations)
                .strategy("FREQUENTLY_BOUGHT_TOGETHER")
                .title("Frequently Added Together")
                .description("Items shoppers frequently pair with this product")
                .build();
    }

    private record ScoredProduct(ProductDTO product, double score) {}
}
