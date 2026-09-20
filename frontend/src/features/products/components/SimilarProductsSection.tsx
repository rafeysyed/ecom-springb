import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts';
import type { Product } from '@/api/types/product.types';
import { ProductCard } from '@/features/products/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

interface SimilarProductsSectionProps {
    product?: Product;
    productId?: string;
    maxDisplay?: number;
    className?: string;
}

export function SimilarProductsSection({
    product,
    productId,
    maxDisplay = 10,
    className = '',
}: SimilarProductsSectionProps) {
    const { data: allProducts, isLoading } = useProducts();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const targetProduct = useMemo(() => {
        if (product) return product;
        if (!productId || !allProducts) return null;
        return allProducts.find((p) => p.id === productId) || null;
    }, [product, productId, allProducts]);

    const similarProducts = useMemo(() => {
        if (!targetProduct || !allProducts || allProducts.length === 0) return [];

        const targetCat = (targetProduct.category || '').toLowerCase().trim();
        const targetRoot = (targetProduct.rootCategory || '').toLowerCase().trim();
        const targetBrand = (targetProduct.brand || '').toLowerCase().trim();

        const stopWords = new Set([
            'for', 'and', 'the', 'with', 'in', 'of', 'at', 'from', 'women', 'womens',
            'men', 'mens', 'set', 'piece', 'pcs', '1pc', '20pcs', '30pcs'
        ]);
        const targetTokens = targetProduct.name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2 && !stopWords.has(w));

        const isTargetFootwear =
            targetCat.includes('shoe') ||
            targetCat.includes('sneaker') ||
            targetCat.includes('boot') ||
            targetRoot.includes('shoe') ||
            targetTokens.some((t) => ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'running', 'athletic'].includes(t));

        const isTargetJewelry =
            targetRoot.includes('jewelry') ||
            targetCat.includes('necklace') ||
            targetCat.includes('pendant') ||
            targetCat.includes('earring') ||
            targetCat.includes('bracelet');

        const scored = allProducts
            .filter((p) => p.id !== targetProduct.id && p.inStock)
            .map((p) => {
                const pCat = (p.category || '').toLowerCase().trim();
                const pRoot = (p.rootCategory || '').toLowerCase().trim();
                const pBrand = (p.brand || '').toLowerCase().trim();
                const pName = p.name.toLowerCase();

                let score = 0;

                // 1. Exact Category match: +100
                if (targetCat && pCat === targetCat) {
                    score += 100;
                }

                // 2. Same Root Category match: +40
                if (targetRoot && pRoot === targetRoot) {
                    score += 40;
                }

                // 3. Brand match: +15
                if (targetBrand && pBrand === targetBrand) {
                    score += 15;
                }

                // 4. Token / Keyword overlap in name: +25 each
                let tokenMatches = 0;
                targetTokens.forEach((token) => {
                    if (pName.includes(token)) {
                        tokenMatches++;
                        score += 25;
                    }
                });

                // STRICT ISOLATION RULES:
                // Never show jewelry/necklaces when looking at shoes
                const isCandidateJewelry =
                    pRoot.includes('jewelry') ||
                    pCat.includes('necklace') ||
                    pCat.includes('pendant') ||
                    pCat.includes('crystal');
                if (isTargetFootwear && isCandidateJewelry) {
                    return { product: p, score: 0 };
                }

                // Never show shoes when looking at jewelry
                const isCandidateFootwear =
                    pCat.includes('shoe') ||
                    pCat.includes('sneaker') ||
                    pCat.includes('boot') ||
                    pRoot.includes('shoe');
                if (isTargetJewelry && isCandidateFootwear) {
                    return { product: p, score: 0 };
                }

                // If root categories are completely different AND zero token matches, reject
                if (targetRoot && pRoot !== targetRoot && tokenMatches === 0) {
                    score = 0;
                }

                return { product: p, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score);

        return scored.slice(0, maxDisplay).map((s) => s.product);
    }, [targetProduct, allProducts, maxDisplay]);

    const checkScrollPosition = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScrollPosition();
        el.addEventListener('scroll', checkScrollPosition, { passive: true });
        window.addEventListener('resize', checkScrollPosition);
        return () => {
            el.removeEventListener('scroll', checkScrollPosition);
            window.removeEventListener('resize', checkScrollPosition);
        };
    }, [checkScrollPosition, similarProducts]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const scrollAmount = container.clientWidth * 0.75;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    if (!isLoading && similarProducts.length === 0) {
        return null;
    }

    return (
        <section className={`py-8 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight">Similar Products</h2>
                        <p className="text-xs text-text-muted mt-0.5">
                            Curated matches and alternatives you might like
                        </p>
                    </div>
                </div>

                {/* Carousel Navigation Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleScroll('left')}
                        disabled={!canScrollLeft}
                        aria-label="Previous similar products"
                        className="w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface-muted disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-text transition-all shadow-xs"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleScroll('right')}
                        disabled={!canScrollRight}
                        aria-label="Next similar products"
                        className="w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface-muted disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-text transition-all shadow-xs"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Horizontal Scroll Carousel Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {isLoading
                    ? Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="min-w-[230px] max-w-[260px] shrink-0 snap-start">
                            <ProductCardSkeleton />
                        </div>
                    ))
                    : similarProducts.map((p) => (
                        <div key={p.id} className="min-w-[230px] max-w-[260px] shrink-0 snap-start">
                            <ProductCard product={p} />
                        </div>
                    ))}
            </div>
        </section>
    );
}


