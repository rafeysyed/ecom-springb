import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/api/endpoints/products';

export function useProduct(id: string | undefined) {
    return useQuery({
        queryKey: ['products', id],
        queryFn: () => getProduct(id as string),
        enabled: !!id,
    });
}