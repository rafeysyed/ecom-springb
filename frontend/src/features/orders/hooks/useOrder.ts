import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/api/endpoints/orders';

const ACTIVE_STATUSES = new Set(['PENDING', 'CONFIRMED', 'SHIPPED']);

export function useOrder(orderId: string | undefined) {
    return useQuery({
        queryKey: ['orders', orderId],
        queryFn: () => getOrder(orderId as string),
        enabled: !!orderId,
        // Poll every 10s while the order is still in an active (non-final) state,
        // so the tracking page reflects status changes without a manual refresh.
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status && ACTIVE_STATUSES.has(status) ? 10_000 : false;
        },
    });
}