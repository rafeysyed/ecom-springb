import { useQuery } from '@tanstack/react-query';
import { getOrder } from '@/api/endpoints/orders';

const NON_FINAL_STATUSES = new Set(['CREATED', 'PENDING', 'PAYMENT_PENDING']);

export function useOrder(orderId: string | undefined) {
    return useQuery({
        queryKey: ['orders', orderId],
        queryFn: () => getOrder(orderId as string),
        enabled: !!orderId,
        // Poll every 2s while order is still in CREATED/PENDING status to reflect saga transitions immediately
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status && NON_FINAL_STATUSES.has(status.toUpperCase()) ? 2_000 : false;
        },
    });
}