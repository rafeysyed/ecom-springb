package com.project.recommendationservice.ml;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CollaborativeFilterTest {

    private CollaborativeFilter collaborativeFilter;

    @BeforeEach
    void setUp() {
        collaborativeFilter = new CollaborativeFilter();
    }

    @Test
    @DisplayName("recordInteractionPair: should increment co-occurrence and return top correlated items")
    void recordInteractionPair_ShouldTrackCoOccurrences() {
        UUID itemA = UUID.randomUUID();
        UUID itemB = UUID.randomUUID();
        UUID itemC = UUID.randomUUID();

        // Simulate 3 users buying A & B together
        collaborativeFilter.recordInteractionPair(itemA, itemB);
        collaborativeFilter.recordInteractionPair(itemA, itemB);
        collaborativeFilter.recordInteractionPair(itemA, itemB);

        // Simulate 1 user buying A & C together
        collaborativeFilter.recordInteractionPair(itemA, itemC);

        List<UUID> topForA = collaborativeFilter.getTopCorrelatedItems(itemA, 5);

        assertEquals(2, topForA.size());
        assertEquals(itemB, topForA.get(0), "Item B should be top correlated item with 3 co-occurrences");
        assertEquals(itemC, topForA.get(1));
    }

    @Test
    @DisplayName("recordInteractionPair: should ignore self-pairing and null IDs")
    void recordInteractionPair_ShouldIgnoreInvalidPairs() {
        UUID item = UUID.randomUUID();
        collaborativeFilter.recordInteractionPair(item, item);
        collaborativeFilter.recordInteractionPair(item, null);

        List<UUID> correlated = collaborativeFilter.getTopCorrelatedItems(item, 5);
        assertTrue(correlated.isEmpty());
    }
}
