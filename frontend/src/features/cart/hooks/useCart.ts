import { useCartStore } from '@/features/cart/cartStore';

/** Convenience wrapper so components don't import useCartStore directly everywhere. */
export function useCart() {
    const items = useCartStore((s) => s.items);
    const addItem = useCartStore((s) => s.addItem);
    const removeItem = useCartStore((s) => s.removeItem);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const clearCart = useCartStore((s) => s.clearCart);
    const totalItems = useCartStore((s) => s.totalItems());
    const totalPrice = useCartStore((s) => s.totalPrice());
    const toOrderItems = useCartStore((s) => s.toOrderItems);

    return {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        toOrderItems,
        isEmpty: items.length === 0,
    };
}