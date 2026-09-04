import { Sparkles } from 'lucide-react';
import { useSimilarProducts } from '@/features/products/hooks/useSimilarProducts';
import { ProductCard } from '@/features/products/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

interface SimilarProductsSectionProps {
    productId: string;
    maxDisplay?: number;
    className?: string;
}

export function SimilarProductsSection({
    productId,
    maxDisplay = 4,
    className = '',
}: SimilarProductsSectionProps) {
    const { data: similarProducts, isLoading } = useSimilarProducts(productId, maxDisplay);

    if (!isLoading && (!similarProducts || similarProducts.length === 0)) {
        return null;
    }

    return (
        <section className={`py-8 ${className}`}>
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles size={16} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-text">Similar Products</h2>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading
                    ? Array.from({ length: maxDisplay }, (_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))
                    : similarProducts?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
            </div>
        </section>
    );
}
