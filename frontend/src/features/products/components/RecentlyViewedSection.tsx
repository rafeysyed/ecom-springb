import { History, Trash2 } from 'lucide-react';
import { useRecentlyViewed } from '@/features/products/hooks/useRecentlyViewed';
import { ProductCard } from '@/features/products/components/ProductCard';

interface RecentlyViewedSectionProps {
    title?: string;
    excludeProductId?: string;
    maxDisplay?: number;
    className?: string;
}

export function RecentlyViewedSection({
    title = 'Recently Viewed',
    excludeProductId,
    maxDisplay = 4,
    className = '',
}: RecentlyViewedSectionProps) {
    const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

    const displayedProducts = recentlyViewed
        .filter((p) => !excludeProductId || p.id !== excludeProductId)
        .slice(0, maxDisplay);

    if (displayedProducts.length === 0) {
        return null;
    }

    return (
        <section className={`py-8 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-muted">
                        <History size={16} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-text">{title}</h2>
                        <p className="text-xs text-text-muted">Items you've browsed during your visit</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={clearRecentlyViewed}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors px-2.5 py-1.5 rounded hover:bg-surface-muted"
                    title="Clear recently viewed history"
                >
                    <Trash2 size={13} />
                    <span>Clear history</span>
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
