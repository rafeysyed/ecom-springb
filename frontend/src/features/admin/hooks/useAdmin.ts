import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminOrders, updateOrderStatus, createAdminProduct, type CreateProductPayload } from '@/features/admin/api/admin';
import type { OrderStatus } from '@/api/types/order.types';
import { useToast } from '@/components/ui/Toast';

export function useAdminOrders() {
    return useQuery({
        queryKey: ['admin', 'orders'],
        queryFn: getAdminOrders,
        refetchInterval: 5000,
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
            updateOrderStatus(orderId, status),
        onSuccess: (updatedOrder) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders', updatedOrder.orderId] });
            showToast(`Order status updated to ${updatedOrder.status}`, 'success');
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || 'Failed to update order status';
            showToast(msg, 'error');
        },
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (payload: CreateProductPayload) => createAdminProduct(payload),
        onSuccess: (product) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            showToast(`Product "${product.name}" created successfully!`, 'success');
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || 'Failed to create product';
            showToast(msg, 'error');
        },
    });
}
