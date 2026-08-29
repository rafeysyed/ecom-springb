import { useMutation, useQueryClient } from '@tanstack/react-query';
import { placeOrder } from '@/api/endpoints/orders';
import type { PlaceOrderRequest } from '@/api/types/order.types';

export function usePlaceOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: PlaceOrderRequest) => placeOrder(payload),
        onSuccess: (order) => {
            // Invalidate order history so it refetches with the new order included.
            queryClient.invalidateQueries({ queryKey: ['orders', 'history', order.userId] });
        },
    });
}