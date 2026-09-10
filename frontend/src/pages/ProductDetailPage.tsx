import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductGallery } from '@/features/products/components/ProductGallery';
import { RatingStars } from '@/components/ui/RatingStars';
import { PriceTag } from '@/components/ui/PriceTag';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useProduct } from '@/features/products/hooks/useProduct';
import { useRecentlyViewed } from '@/features/products/hooks/useRecentlyViewed';
import { RecentlyViewedSection } from '@/features/products/components/RecentlyViewedSection';
import { SimilarProductsSection } from '@/features/products/components/SimilarProductsSection';
import { useCartStore } from '@/features/cart/cartStore';
import { useToast } from '@/components/ui/Toast';
import { useSearch } from '@/context/SearchContext';
import { parseImageUrls, parseAvailableSizes } from '@/api/types/product.types';

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: product, isLoading, isError, refetch } = useProduct(id);
    const { recordView } = useRecentlyViewed();
    const addItem = useCartStore((s) => s.addItem);
    const { setSelectedRootCategory, setSelectedCategory, setSelectedBrand } = useSearch();
    const { showToast } = useToast();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>('');

    useEffect(() => {
        if (product) {
            recordView(product);
            const sizes = parseAvailableSizes(product);
            if (sizes.length > 0) {
                setSelectedSize(sizes[0]);
            } else if (product.size) {
                setSelectedSize(product.size);
            }
        }
    }, [product, recordView]);

    if (isLoading) {
        return (
            <PageContainer>
                <LoadingState label="Loading product…" />
            </PageContainer>
        );
    }

    if (isError || !product) {
        return (
            <PageContainer>
                <ErrorState
                    title="Product not found"
                    description="This product may no longer be available."
                    onRetry={() => refetch()}
                />
            </PageContainer>
        );
    }

    const images = parseImageUrls(product);
    const availableSizes = parseAvailableSizes(product);

    const handleAddToCart = () => {
        addItem(product, quantity, selectedSize || product.size || undefined, product.color || undefined);
        showToast(
            `Added ${quantity} × "${product.name}"${selectedSize ? ` (${selectedSize})` : ''} to cart`,
            'success'
        );
    };

    // Clicking root category in breadcrumbs filters by it
    const handleRootCategoryClick = () => {
        if (product.rootCategory) {
            setSelectedRootCategory(product.rootCategory);
            setSelectedCategory(null);
            setSelectedBrand(null);
        }
    };

    // Breadcrumb format: Shop > [RootCategory] > [Brand Name] [Subcategory Name]
    const lastCrumbLabel = [product.brand, product.category].filter(Boolean).join(' ') || product.name;

    return (
        <PageContainer>
            <div className="mb-6">
                <Breadcrumbs
                    items={[
                        { label: 'Shop', href: '/products' },
                        {
                            label: product.rootCategory || 'Products',
                            href: '/products',
                            onClick: handleRootCategoryClick,
                        },
                        { label: lastCrumbLabel },
                    ]}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-10">
                <ProductGallery images={images} alt={product.name} />

                <div className="flex flex-col gap-4">
                    <div>
                        {/* Brand Name is bigger and prominent */}
                        <button
                            type="button"
                            onClick={() => {
                                if (product.brand) {
                                    setSelectedBrand(product.brand);
                                    setSelectedRootCategory(null);
                                    setSelectedCategory(null);
                                }
                            }}
                            className="text-sm font-bold text-text uppercase tracking-wider block mb-1 hover:text-primary transition-colors text-left"
                        >
                            {product.brand || 'MRKT'}
                        </button>
                        {/* Product Name is smaller and lighter */}
                        <h1 className="text-xl font-normal text-text-muted leading-snug">
                            {product.name}
                        </h1>
                    </div>

                    <RatingStars rating={product.rating} reviewsCount={product.reviewsCount} size={16} />

                    <PriceTag product={product} size="lg" />

                    {!product.inStock && <Badge tone="neutral">Out of stock</Badge>}

                    <p className="text-sm text-text-muted leading-relaxed border-t border-border pt-4">
                        {product.description}
                    </p>

                    {availableSizes.length > 0 && (
                        <div className="flex flex-col gap-2 border-t border-border pt-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-text uppercase tracking-wide">Available Sizes</span>
                                {selectedSize && (
                                    <span className="text-text-muted">
                                        Selected: <strong className="text-primary">{selectedSize}</strong>
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map((size) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                            selectedSize === size
                                                ? 'border-primary bg-primary/10 text-primary shadow-xs font-bold'
                                                : 'border-border text-text hover:border-text-muted/60 bg-surface'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 border-t border-border pt-4">
                        <span className="text-sm font-medium text-text">Quantity</span>
                        <div className="flex items-center gap-1 bg-surface-muted rounded-sm p-0.5">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-surface transition-colors text-text-muted"
                                aria-label="Decrease quantity"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-surface transition-colors text-text-muted"
                                aria-label="Increase quantity"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className="mt-2"
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>

            <SimilarProductsSection
                productId={product.id}
                className="mt-16 border-t border-border pt-10"
                maxDisplay={4}
            />

            <RecentlyViewedSection
                excludeProductId={product.id}
                className="mt-12 border-t border-border pt-10"
                maxDisplay={4}
            />
        </PageContainer>
    );
}