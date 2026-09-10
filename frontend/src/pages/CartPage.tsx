import { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { CartItem } from '@/features/cart/components/CartItem';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCart } from '@/features/cart/hooks/useCart';
import { useProducts } from '@/features/products/hooks/useProducts';
import { SavedForLaterSection } from '@/features/cart/components/SavedForLaterSection';
import { CartCrossSell } from '@/features/cart/components/CartCrossSell';
import { ClearCartModal } from '@/features/cart/components/ClearCartModal';
import { useToast } from '@/components/ui/Toast';

export function CartPage() {
    const {
        items,
        savedForLater,
        updateQuantity,
        updateSize,
        removeItem,
        clearCart,
        saveForLater,
        totalItems,
        revalidateItems,
        isEmpty,
    } = useCart();

    const { data: products } = useProducts();
    const { showToast } = useToast();
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    // Stale Price & Stock Revalidation
    useEffect(() => {
        if (products && products.length > 0 && items.length > 0) {
            const { updatedPrices, outOfStockCount } = revalidateItems(products);
            if (updatedPrices > 0) {
                showToast(`Cart prices were refreshed with latest catalog values.`, 'info');
            }
            if (outOfStockCount > 0) {
                showToast(`Note: ${outOfStockCount} item(s) in your cart are currently out of stock.`, 'error');
            }
        }
    }, [products]);

    if (isEmpty && savedForLater.length === 0) {
        return (
            <PageContainer className="max-w-4xl py-12">
                <EmptyState
                    icon={<ShoppingBag size={28} />}
                    title="Your shopping cart is empty"
                    description="Looks like you haven't added anything to your cart yet. Discover trending items across our catalog."
                    action={
                        <Link to="/products">
                            <Button size="lg" className="mt-2">
                                Start Shopping
                            </Button>
                        </Link>
                    }
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer className="max-w-6xl py-8">
            {/* Header / Actions */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <Link
                        to="/products"
                        className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1.5 mb-2"
                    >
                        <ArrowLeft size={14} />
                        Continue Shopping
                    </Link>
                    <h1 className="text-2xl font-bold text-text">
                        Shopping Cart <span className="text-text-muted font-normal text-lg">({totalItems} items)</span>
                    </h1>
                </div>

                {!isEmpty && (
                    <button
                        type="button"
                        onClick={() => setIsClearModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger border border-border hover:border-danger/30 px-3 py-1.5 rounded-lg transition-all"
                    >
                        <Trash2 size={14} />
                        Clear All Items
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Cart Items, Cross-Sell, Saved for Later */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {!isEmpty ? (
                        <Card padding="lg" className="divide-y divide-border">
                            {items.map((item) => (
                                <CartItem
                                    key={`${item.productId}::${item.selectedSize || 'default'}`}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeItem}
                                    onSaveForLater={saveForLater}
                                    onUpdateSize={updateSize}
                                />
                            ))}
                        </Card>
                    ) : (
                        <Card padding="lg" className="text-center py-10 text-text-muted">
                            <ShoppingBag size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Your active cart is empty.</p>
                            <p className="text-xs text-text-muted/80 mt-1">Review your saved items below or browse our catalog.</p>
                        </Card>
                    )}

                    {/* Cross-Sell Recommendations */}
                    <CartCrossSell maxDisplay={3} />

                    {/* Saved for Later Section */}
                    <SavedForLaterSection />
                </div>

                {/* Right Column: Order Summary & Checkout */}
                {!isEmpty && (
                    <div className="lg:col-span-1">
                        <CartSummary />
                    </div>
                )}
            </div>

            {/* Clear Cart Confirmation Modal */}
            <ClearCartModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={() => {
                    clearCart();
                    showToast('Shopping cart cleared', 'info');
                }}
            />
        </PageContainer>
    );
}