import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/api/types/product.types';

const STORAGE_KEY = 'ecom_recently_viewed';
const MAX_ITEMS = 8;
const CUSTOM_EVENT_NAME = 'ecom_recently_viewed_updated';

function getStoredProducts(): Product[] {
    try {
        const item = localStorage.getItem(STORAGE_KEY);
        if (!item) return [];
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function useRecentlyViewed() {
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(getStoredProducts);

    useEffect(() => {
        const handleUpdate = () => {
            setRecentlyViewed(getStoredProducts());
        };

        window.addEventListener(CUSTOM_EVENT_NAME, handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener(CUSTOM_EVENT_NAME, handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    const recordView = useCallback((product: Product) => {
        if (!product || !product.id) return;

        try {
            const current = getStoredProducts();
            // Remove existing instance of this product if present
            const filtered = current.filter((p) => p.id !== product.id);
            // Prepend the new product to the front
            const updated = [product, ...filtered].slice(0, MAX_ITEMS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setRecentlyViewed(updated);
            window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
        } catch {
            // Silently fail if localStorage is restricted or full
        }
    }, []);

    const clearRecentlyViewed = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setRecentlyViewed([]);
            window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
        } catch {
            // ignore
        }
    }, []);

    return {
        recentlyViewed,
        recordView,
        clearRecentlyViewed,
    };
}
