import { apiClient } from '@/api/client';
import type { Order, OrderStatus } from '@/api/types/order.types';
import type { Product } from '@/api/types/product.types';

export interface CreateProductPayload {
    name: string;
    description: string;
    price: number;
    initialPrice?: number;
    brand: string;
    category: string;
    rootCategory?: string;
    mainImage: string;
    inStock: boolean;
}

export async function getAdminOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const { data } = await apiClient.put<Order>(`/orders/${orderId}/status`, { status });
    return data;
}

export async function createAdminProduct(payload: CreateProductPayload): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', payload);
    return data;
}
