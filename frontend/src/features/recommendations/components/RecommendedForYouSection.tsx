import { useRecommendationsForYou } from '../hooks/useRecommendations';
import { ProductGrid } from '@/features/products/components/ProductGrid';

interface RecommendedForYouSectionProps {
    limit?: number;
}

export function RecommendedForYouSection({ limit = 8 }: RecommendedForYouSectionProps) {
    const { data, isLoading } = useRecommendationsForYou(limit);

    const products = data?.products ?? [];
    if (!isLoading && products.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                    <h2 className="text-xl font-semibold text-text">
                        {data?.title ?? 'Recommended For You'}
                    </h2>
                    <p className="text-xs text-text-muted mt-1">
                        {data?.description ?? 'Curated based on your browsing and shopping interests'}
                    </p>
                </div>
            </div>

            <ProductGrid products={products} isLoading={isLoading} />
        </section>
    );
}
