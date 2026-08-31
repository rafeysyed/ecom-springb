import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useProducts } from '@/features/products/hooks/useProducts';

export function HomePage() {
    const { data: products, isLoading, isError, refetch } = useProducts();
    const featured = products?.slice(0, 8) ?? [];

    return (
        <>
            <div className="bg-surface-muted">
                <PageContainer className="py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-semibold text-text tracking-tight mb-4">
                        Everything you need.
                    </h1>
                    <p className="text-text-muted max-w-md mx-auto mb-8">
                        A curated selection of quality products
                        delivered quickly and without the noise.
                    </p>
                    <Link to="/products">
                        <Button size="lg">
                            Shop all products
                            <ArrowRight size={18} />
                        </Button>
                    </Link>
                </PageContainer>
            </div>

            <PageContainer>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text">Featured</h2>
                    <Link to="/products" className="text-sm text-primary hover:text-primary-hover font-medium">
                        View all
                    </Link>
                </div>

                {isError ? (
                    <ErrorState onRetry={() => refetch()} />
                ) : (
                    <ProductGrid products={featured} isLoading={isLoading} />
                )}
            </PageContainer>
        </>
    );
}