import { useQuery } from '@tanstack/react-query';
import { getOrderHistory } from '@/api/endpoints/orders';

export function useOrderHistory(userId: string | undefined | null) {
    return useQuery({
        queryKey: ['orders', 'history', userId],
        queryFn: () => getOrderHistory(userId as string),
        enabled: !!userId,
    });
}