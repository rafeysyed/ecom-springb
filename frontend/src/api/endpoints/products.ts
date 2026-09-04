import { apiClient } from '@/api/client';
import type { Product } from '@/api/types/product.types';

export async function getProducts(): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/products');
    return data;
}

export async function getProduct(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
}

export async function getSimilarProducts(id: string, limit: number = 6): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>(`/products/${id}/similar`, {
        params: { limit },
    });
    return data;
}