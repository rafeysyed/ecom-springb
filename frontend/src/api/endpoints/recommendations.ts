import { apiClient } from '../client';
import type { Product } from '../types/product.types';
import { useAuthStore } from '@/store/authStore';
import { queryClient } from '@/lib/queryClient';

export interface RecommendationResponse {
    products: Product[];
    strategy: string;
    title: string;
    description: string;
}

export function getEffectiveUserId(): string {
    const authUserId = useAuthStore.getState().userId;
    if (authUserId) return authUserId;

    if (typeof window === 'undefined') return '';

    let guestId = localStorage.getItem('guest_session_id');
    if (!guestId) {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            guestId = crypto.randomUUID();
        } else {
            guestId = '10000000-1000-4000-8000-' + Date.now().toString(16).padStart(12, '0');
        }
        localStorage.setItem('guest_session_id', guestId);
    }
    return guestId;
}

export const recommendationsApi = {
    getRecommendationsForYou: async (limit = 8): Promise<RecommendationResponse> => {
        const userId = getEffectiveUserId();
        const url = userId
            ? `/recommendations/for-you?limit=${limit}&userId=${userId}`
            : `/recommendations/for-you?limit=${limit}`;
        const response = await apiClient.get<RecommendationResponse>(url);
        return response.data;
    },

    getFrequentlyBoughtTogether: async (productId: string, limit = 3): Promise<RecommendationResponse> => {
        const response = await apiClient.get<RecommendationResponse>(
            `/recommendations/frequently-bought-together?productId=${productId}&limit=${limit}`
        );
        return response.data;
    },

    trackInteraction: async (productId: string, eventType: 'VIEW' | 'CART_ADD' | 'PURCHASE'): Promise<void> => {
        try {
            const userId = getEffectiveUserId();
            await apiClient.post('/recommendations/interactions', {
                userId: userId || undefined,
                productId,
                eventType,
                timestamp: new Date().toISOString(),
            });
            // Automatically invalidate recommendations in React Query so any mounted section refreshes
            queryClient.invalidateQueries({ queryKey: ['recommendations', 'for-you'] });
        } catch {
            // Fire-and-forget: interaction tracking failure should never block UI
        }
    },
};
