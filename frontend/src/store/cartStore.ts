import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/api/types/product.types';
import type { PlaceOrderItemRequest } from '@/api/types/order.types';

export interface CartItem {
    productId: string;
    quantity: number;
    /** Full product kept so the cart UI can show price/image without refetching. */
    product: Product;
}

interface CartState {
    items: CartItem[];

    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    totalItems: () => number;
    totalPrice: () => number;
    /** Maps cart state to the exact shape POST /orders expects. */
    toOrderItems: () => PlaceOrderItemRequest[];
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, quantity = 1) => {
                set((state) => {
                    const existing = state.items.find((i) => i.productId === product.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.productId === product.id
                                    ? { ...i, quantity: i.quantity + quantity }
                                    : i
                            ),
                        };
                    }
                    return {
                        items: [...state.items, { productId: product.id, quantity, product }],
                    };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((i) => i.productId !== productId),
                }));
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            totalPrice: () =>
                get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

            toOrderItems: () =>
                get().items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
        {
            name: 'cart-storage', // localStorage key
        }
    )
);