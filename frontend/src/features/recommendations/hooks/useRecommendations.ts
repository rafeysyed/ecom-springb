import { useQuery } from '@tanstack/react-query';
import { recommendationsApi } from '@/api/endpoints/recommendations';

export function useRecommendationsForYou(limit = 8) {
    return useQuery({
        queryKey: ['recommendations', 'for-you', limit],
        queryFn: () => recommendationsApi.getRecommendationsForYou(limit),
        staleTime: 30000,
    });
}

export function useFrequentlyBoughtTogether(productId?: string, limit = 3) {
    return useQuery({
        queryKey: ['recommendations', 'frequently-bought-together', productId, limit],
        queryFn: () => (productId ? recommendationsApi.getFrequentlyBoughtTogether(productId, limit) : null),
        enabled: !!productId,
        staleTime: 60000,
    });
}
