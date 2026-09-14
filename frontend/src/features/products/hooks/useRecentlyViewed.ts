import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/api/types/product.types';
import { useAuthStore } from '@/features/auth/authStore';

const STORAGE_PREFIX = 'ecom_recently_viewed';
const MAX_ITEMS = 8;
const CUSTOM_EVENT_NAME = 'ecom_recently_viewed_updated';

function getStorageKey(userId: string | null): string {
    return userId ? `${STORAGE_PREFIX}_${userId}` : `${STORAGE_PREFIX}_guest`;
}

function getStoredProducts(storageKey: string): Product[] {
    try {
        const item = localStorage.getItem(storageKey);
        if (!item) return [];
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function useRecentlyViewed() {
    const userId = useAuthStore((s) => s.userId);
    const storageKey = getStorageKey(userId);

    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => getStoredProducts(storageKey));

    useEffect(() => {
        setRecentlyViewed(getStoredProducts(storageKey));

        const handleUpdate = () => {
            setRecentlyViewed(getStoredProducts(storageKey));
        };

        window.addEventListener(CUSTOM_EVENT_NAME, handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener(CUSTOM_EVENT_NAME, handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [storageKey]);

    const recordView = useCallback(
        (product: Product) => {
            if (!product || !product.id) return;

            try {
                const current = getStoredProducts(storageKey);
                // Remove existing instance of this product if present
                const filtered = current.filter((p) => p.id !== product.id);
                // Prepend the new product to the front
                const updated = [product, ...filtered].slice(0, MAX_ITEMS);

                localStorage.setItem(storageKey, JSON.stringify(updated));
                setRecentlyViewed(updated);
                window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
            } catch {
                // Silently fail if localStorage is restricted or full
            }
        },
        [storageKey]
    );

    const clearRecentlyViewed = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            setRecentlyViewed([]);
            window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
        } catch {
            // ignore
        }
    }, [storageKey]);

    return {
        recentlyViewed,
        recordView,
        clearRecentlyViewed,
    };
}
