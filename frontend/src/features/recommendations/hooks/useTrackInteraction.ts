import { useEffect, useRef } from 'react';
import { recommendationsApi } from '@/api/endpoints/recommendations';

export function useTrackInteraction(productId?: string, eventType: 'VIEW' | 'CART_ADD' | 'PURCHASE' = 'VIEW') {
    const trackedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!productId) return;
        const key = `${productId}-${eventType}`;
        if (trackedRef.current === key) return;

        trackedRef.current = key;
        recommendationsApi.trackInteraction(productId, eventType);
    }, [productId, eventType]);
}
