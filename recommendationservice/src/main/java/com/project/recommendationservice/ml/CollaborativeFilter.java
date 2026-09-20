package com.project.recommendationservice.ml;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class CollaborativeFilter {

    // itemCoOccurrence: ItemA -> Map<ItemB, count>
    private final Map<UUID, Map<UUID, Integer>> itemCoOccurrence = new ConcurrentHashMap<>();

    public void recordInteractionPair(UUID itemA, UUID itemB) {
        if (itemA == null || itemB == null || itemA.equals(itemB)) return;

        itemCoOccurrence.computeIfAbsent(itemA, k -> new ConcurrentHashMap<>())
                .merge(itemB, 1, Integer::sum);
        itemCoOccurrence.computeIfAbsent(itemB, k -> new ConcurrentHashMap<>())
                .merge(itemA, 1, Integer::sum);
    }

    public List<UUID> getTopCorrelatedItems(UUID itemId, int limit) {
        Map<UUID, Integer> correlated = itemCoOccurrence.get(itemId);
        if (correlated == null || correlated.isEmpty()) {
            return Collections.emptyList();
        }

        return correlated.entrySet().stream()
                .sorted(Map.Entry.<UUID, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .toList();
    }
}
