import { useCartStore } from '@/features/cart/cartStore';

/** Convenience wrapper providing easy access to all cart state and actions. */
export function useCart() {
    const items = useCartStore((s) => s.items);
    const savedForLater = useCartStore((s) => s.savedForLater);
    const appliedPromo = useCartStore((s) => s.appliedPromo);

    const addItem = useCartStore((s) => s.addItem);
    const removeItem = useCartStore((s) => s.removeItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const updateSize = useCartStore((s) => s.updateSize);
    const clearCart = useCartStore((s) => s.clearCart);

    const saveForLater = useCartStore((s) => s.saveForLater);
    const moveToCart = useCartStore((s) => s.moveToCart);
    const removeSavedItem = useCartStore((s) => s.removeSavedItem);

    const applyPromoCode = useCartStore((s) => s.applyPromoCode);
    const removePromoCode = useCartStore((s) => s.removePromoCode);
    const revalidateItems = useCartStore((s) => s.revalidateItems);

    const totalItems = useCartStore((s) => s.totalItems());
    const subtotal = useCartStore((s) => s.subtotal());
    const discountAmount = useCartStore((s) => s.discountAmount());
    const shippingFee = useCartStore((s) => s.shippingFee());
    const finalTotal = useCartStore((s) => s.finalTotal());
    const totalPrice = useCartStore((s) => s.totalPrice()); // backward compatibility
    const freeShippingRemaining = useCartStore((s) => s.freeShippingRemaining());
    const freeShippingProgress = useCartStore((s) => s.freeShippingProgress());
    const toOrderItems = useCartStore((s) => s.toOrderItems);

    const syncToBackend = useCartStore((s) => s.syncToBackend);
    const loadFromBackend = useCartStore((s) => s.loadFromBackend);

    return {
        items,
        savedForLater,
        appliedPromo,
        addItem,
        removeItem,
        updateQuantity,
        updateSize,
        clearCart,
        saveForLater,
        moveToCart,
        removeSavedItem,
        applyPromoCode,
        removePromoCode,
        revalidateItems,
        totalItems,
        subtotal,
        discountAmount,
        shippingFee,
        finalTotal,
        totalPrice,
        freeShippingRemaining,
        freeShippingProgress,
        toOrderItems,
        syncToBackend,
        loadFromBackend,
        isEmpty: items.length === 0,
    };
}