import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/api/endpoints/products';

export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });
}