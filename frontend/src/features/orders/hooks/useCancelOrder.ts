import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelOrder } from '@/api/endpoints/orders';

export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => cancelOrder(orderId),
        onSuccess: (_data, orderId) => {
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}
