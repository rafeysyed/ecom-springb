import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartItem } from '@/features/cart/components/CartItem';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatCurrency';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, updateQuantity, removeItem, totalPrice, isEmpty } = useCart();

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-surface h-full shadow-soft-hover flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <h2 className="text-base font-semibold text-text">Your Cart</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close cart"
                        className="p-1.5 rounded-sm hover:bg-surface-muted transition-colors text-text-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6">
                    {isEmpty ? (
                        <EmptyState
                            icon={<ShoppingBag size={24} />}
                            title="Your cart is empty"
                            description="Add something you love to get started."
                        />
                    ) : (
                        items.map((item) => (
                            <CartItem
                                key={item.productId}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                            />
                        ))
                    )}
                </div>

                {!isEmpty && (
                    <div className="border-t border-border p-6 flex flex-col gap-3">
                        <div className="flex justify-between text-sm font-medium text-text">
                            <span>Subtotal</span>
                            <span>{formatCurrency(totalPrice)}</span>
                        </div>
                        <Link to="/checkout" onClick={onClose}>
                            <Button className="w-full">Checkout</Button>
                        </Link>
                        <Link to="/cart" onClick={onClose}>
                            <Button variant="ghost" className="w-full">
                                View full cart
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}