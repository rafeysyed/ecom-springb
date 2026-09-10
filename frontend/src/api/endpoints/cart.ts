import { apiClient } from '@/api/client';

export interface UserCartItemDTO {
    productId: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
}

export interface SyncCartRequestDTO {
    items: UserCartItemDTO[];
}

export async function fetchUserCart(userId?: string): Promise<UserCartItemDTO[]> {
    const params = userId ? { userId } : {};
    const { data } = await apiClient.get<UserCartItemDTO[]>('/internal/users/cart', { params });
    return data;
}

export async function syncUserCart(payload: SyncCartRequestDTO, userId?: string): Promise<UserCartItemDTO[]> {
    const params = userId ? { userId } : {};
    const { data } = await apiClient.put<UserCartItemDTO[]>('/internal/users/cart', payload, { params });
    return data;
}

export async function clearUserCart(userId?: string): Promise<void> {
    const params = userId ? { userId } : {};
    await apiClient.delete('/internal/users/cart', { params });
}
