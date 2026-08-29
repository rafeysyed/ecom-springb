import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Product } from '@/api/types/product.types';
import { Card } from '@/components/ui/Card';
import { RatingStars } from '@/components/ui/RatingStars';
import { PriceTag } from '@/components/ui/PriceTag';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/features/cart/cartStore';
import { useToast } from '@/components/ui/Toast';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((s) => s.addItem);
    const { showToast } = useToast();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // don't navigate when clicking the add button inside the Link
        addItem(product, 1);
        showToast(`Added "${product.name}" to cart`, 'success');
    };

    return (
        <Link to={`/products/${product.id}`}>
            <Card interactive padding="none" className="overflow-hidden flex flex-col h-full">
                <div className="relative aspect-square bg-surface-muted">
                    <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    {!product.inStock && (
                        <Badge tone="neutral" className="absolute top-3 left-3">
                            Out of stock
                        </Badge>
                    )}
                    <button
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        aria-label="Add to cart"
                        className="
              absolute bottom-3 right-3 p-2.5 rounded-full
              bg-surface shadow-soft-hover text-primary
              hover:bg-primary hover:text-white
              transition-colors duration-150
              disabled:opacity-40 disabled:pointer-events-none
            "
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-1.5 flex-1">
                    {/* Brand Name is bigger and more prominent than product name */}
                    <span className="text-sm font-semibold text-text uppercase tracking-wide truncate">
                        {product.brand || 'MRKT'}
                    </span>
                    {/* Product Name is smaller and secondary */}
                    <h3 className="text-xs font-normal text-text-muted line-clamp-2 leading-relaxed">
                        {product.name}
                    </h3>
                    <div className="pt-1">
                        <RatingStars rating={product.rating} reviewsCount={product.reviewsCount} />
                    </div>
                    <div className="mt-auto pt-2">
                        <PriceTag product={product} />
                    </div>
                </div>
            </Card>
        </Link>
    );
}