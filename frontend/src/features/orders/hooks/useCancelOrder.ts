import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelOrder } from '@/api/endpoints/orders';

export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => cancelOrder(orderId),
        onSuccess: (updatedOrder, orderId) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
            if (updatedOrder) {
                queryClient.setQueryData(['orders', orderId], updatedOrder);
            }
        },
    });
}
