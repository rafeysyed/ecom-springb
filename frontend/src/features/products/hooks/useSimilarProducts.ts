import { useQuery } from '@tanstack/react-query';
import { getSimilarProducts } from '@/api/endpoints/products';

export function useSimilarProducts(productId?: string, limit: number = 4) {
    return useQuery({
        queryKey: ['products', 'similar', productId, limit],
        queryFn: () => (productId ? getSimilarProducts(productId, limit) : Promise.resolve([])),
        enabled: Boolean(productId),
        staleTime: 5 * 60 * 1000,
    });
}
