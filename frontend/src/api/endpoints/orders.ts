import { apiClient } from '@/api/client';
import type { PlaceOrderRequest, Order } from '@/api/types/order.types';

export async function placeOrder(payload: PlaceOrderRequest): Promise<Order> {
    const { data } = await apiClient.post<Order>('/orders', payload);
    return data;
}

export async function getOrder(orderId: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/orders/${orderId}`);
    return data;
}

export async function getOrderHistory(userId: string): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>(`/orders/user/${userId}`);
    return data;
}

export async function cancelOrder(orderId: string): Promise<Order> {
    const { data } = await apiClient.put<Order>(`/orders/${orderId}/cancel`);
    return data;
}