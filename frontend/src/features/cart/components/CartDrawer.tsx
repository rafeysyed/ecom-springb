import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartItem } from '@/features/cart/components/CartItem';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatCurrency';
import { FreeShippingBar } from '@/features/cart/components/FreeShippingBar';
import { CartCrossSell } from '@/features/cart/components/CartCrossSell';
import { ClearCartModal } from '@/features/cart/components/ClearCartModal';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const {
        items,
        updateQuantity,
        updateSize,
        removeItem,
        clearCart,
        saveForLater,
        finalTotal,
        discountAmount,
        appliedPromo,
        isEmpty,
        totalItems,
    } = useCart();

    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose} />

            <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={18} className="text-primary" />
                        <h2 className="text-base font-semibold text-text">Your Cart ({totalItems})</h2>
                    </div>
                    <div className="flex items-center gap-1">
                        {!isEmpty && (
                            <button
                                type="button"
                                onClick={() => setIsClearModalOpen(true)}
                                aria-label="Clear cart"
                                className="p-1.5 rounded-md hover:bg-surface-muted transition-colors text-text-muted hover:text-danger text-xs flex items-center gap-1 mr-2"
                                title="Clear all items"
                            >
                                <Trash2 size={15} />
                                <span className="hidden sm:inline">Clear</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close cart"
                            className="p-1.5 rounded-md hover:bg-surface-muted transition-colors text-text-muted hover:text-text"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Free Shipping Tracker */}
                {!isEmpty && (
                    <div className="px-6 pt-4">
                        <FreeShippingBar />
                    </div>
                )}

                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-6 divide-y divide-border">
                    {isEmpty ? (
                        <EmptyState
                            icon={<ShoppingBag size={24} />}
                            title="Your cart is empty"
                            description="Add items from our catalog to get started."
                            action={
                                <Link to="/products" onClick={onClose}>
                                    <Button size="sm" className="mt-2">Explore Products</Button>
                                </Link>
                            }
                        />
                    ) : (
                        items.map((item) => (
                            <CartItem
                                key={`${item.productId}::${item.selectedSize || 'default'}`}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                                onSaveForLater={saveForLater}
                                onUpdateSize={updateSize}
                            />
                        ))
                    )}

                    {/* Cross-Sell Recommendations inside Drawer */}
                    {!isEmpty && (
                        <div className="py-5">
                            <CartCrossSell maxDisplay={2} />
                        </div>
                    )}
                </div>

                {/* Footer / Summary */}
                {!isEmpty && (
                    <div className="border-t border-border p-6 flex flex-col gap-3 bg-surface-muted/20">
                        {appliedPromo && discountAmount > 0 && (
                            <div className="flex justify-between text-xs text-emerald-600 font-medium">
                                <span>Discount ({appliedPromo.code})</span>
                                <span>-{formatCurrency(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-text">
                            <span>Estimated Total</span>
                            <span className="text-primary font-bold text-lg">{formatCurrency(finalTotal)}</span>
                        </div>
                        <Link to="/checkout" onClick={onClose}>
                            <Button className="w-full" size="lg">
                                Checkout Now
                            </Button>
                        </Link>
                        <Link to="/cart" onClick={onClose}>
                            <Button variant="ghost" className="w-full text-xs">
                                View Full Cart Details
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Clear Cart Confirmation Modal */}
            <ClearCartModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={clearCart}
            />
        </div>,
        document.body
    );
}