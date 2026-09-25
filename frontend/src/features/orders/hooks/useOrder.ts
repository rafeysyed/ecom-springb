import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/api/endpoints/orders';

const FINAL_STATUSES = new Set(['DELIVERED', 'CANCELLED', 'FAILED']);

export function useOrder(orderId: string | undefined) {
    return useQuery({
        queryKey: ['orders', orderId],
        queryFn: () => getOrder(orderId as string),
        enabled: !!orderId,
        staleTime: 0,
        refetchOnMount: 'always',
        // Poll every 2.5s until order reaches a terminal state (DELIVERED, CANCELLED, FAILED)
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (!status) return 2_500;
            return !FINAL_STATUSES.has(status.toUpperCase()) ? 2_500 : false;
        },
    });
}