import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useProducts } from '@/features/products/hooks/useProducts';
import { RecommendedForYouSection } from '@/features/recommendations/components/RecommendedForYouSection';
import { HeroBannerCarousel } from '@/features/home/components/HeroBannerCarousel';
import { NewEssentialsSection } from '@/features/home/components/NewEssentialsSection';
import { BrandsWeLoveSection } from '@/features/home/components/BrandsWeLoveSection';

export function HomePage() {
    const { data: products, isLoading, isError, refetch } = useProducts();
    const featured = products?.slice(0, 8) ?? [];

    return (
        <div className="space-y-10 sm:space-y-14 pb-16">
            {/* 1. Hero Banner Carousel: Latest Collections */}
            <div className="pt-4 sm:pt-6">
                <PageContainer>
                    <HeroBannerCarousel />
                </PageContainer>
            </div>

            <PageContainer className="space-y-12 sm:space-y-16">
                {/* 2. Recommended For You: Based on user's overall behavior */}
                <RecommendedForYouSection limit={8} />

                {/* 3. The New Essentials: Curated category anchors */}
                <NewEssentialsSection />

                {/* 4. Brands We Love: Top brand showcases & deals */}
                <BrandsWeLoveSection />

                {/* 5. Featured Catalog Picks */}
                <section className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles size={16} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text tracking-tight">Trending in Catalog</h2>
                                <p className="text-xs text-text-muted mt-0.5">Explore best-selling styles across all departments</p>
                            </div>
                        </div>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-light"
                        >
                            <span>View All Products</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {isError ? (
                        <ErrorState onRetry={() => refetch()} />
                    ) : (
                        <ProductGrid products={featured} isLoading={isLoading} />
                    )}
                </section>
            </PageContainer>
        </div>
    );
}