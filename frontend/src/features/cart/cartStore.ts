import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/api/types/product.types';
import type { PlaceOrderItemRequest } from '@/api/types/order.types';
import { syncUserCart, fetchUserCart } from '@/api/endpoints/cart';

export interface CartItem {
    productId: string;
    quantity: number;
    /** Full product kept so the cart UI can show price/image without refetching. */
    product: Product;
    selectedSize?: string;
    selectedColor?: string;
    availableStock?: number;
}

export interface AppliedPromo {
    code: string;
    discountPercent: number;
    freeShipping: boolean;
    description: string;
}

const PROMO_CODES: Record<string, AppliedPromo> = {
    SAVE10: {
        code: 'SAVE10',
        discountPercent: 10,
        freeShipping: false,
        description: '10% off your entire order',
    },
    WELCOME20: {
        code: 'WELCOME20',
        discountPercent: 20,
        freeShipping: false,
        description: '20% off welcome discount',
    },
    FREESHIP: {
        code: 'FREESHIP',
        discountPercent: 0,
        freeShipping: true,
        description: 'Free standard shipping',
    },
};

export const FREE_SHIPPING_THRESHOLD = 50.0;
export const STANDARD_SHIPPING_FEE = 5.99;

export function getCartItemKey(productId: string, size?: string): string {
    return size ? `${productId}::${size}` : productId;
}

interface CartState {
    items: CartItem[];
    savedForLater: CartItem[];
    appliedPromo: AppliedPromo | null;

    addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
    removeItem: (productId: string, selectedSize?: string) => void;
    updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
    updateSize: (productId: string, oldSize?: string, newSize?: string) => void;
    clearCart: () => void;

    // Save for later
    saveForLater: (productId: string, selectedSize?: string) => void;
    moveToCart: (productId: string, selectedSize?: string) => void;
    removeSavedItem: (productId: string, selectedSize?: string) => void;

    // Promo codes
    applyPromoCode: (code: string) => { success: boolean; message: string };
    removePromoCode: () => void;

    // Revalidation & Catalog sync
    revalidateItems: (freshProducts: Product[]) => { updatedPrices: number; outOfStockCount: number };

    // Financial calculations
    totalItems: () => number;
    subtotal: () => number;
    discountAmount: () => number;
    shippingFee: () => number;
    finalTotal: () => number;
    freeShippingRemaining: () => number;
    freeShippingProgress: () => number;
    totalPrice: () => number; // backward compatibility for checkout

    /** Maps cart state to the exact shape POST /orders expects. */
    toOrderItems: () => PlaceOrderItemRequest[];

    // Backend sync
    syncToBackend: (userId?: string) => Promise<void>;
    loadFromBackend: (userId: string, catalogProducts: Product[]) => Promise<void>;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            savedForLater: [],
            appliedPromo: null,

            addItem: (product, quantity = 1, selectedSize, selectedColor) => {
                const stockLimit = product.inStock ? 15 : 0;
                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (i) => i.productId === product.id && i.selectedSize === selectedSize
                    );

                    if (existingIndex > -1) {
                        const existing = state.items[existingIndex];
                        const newQty = Math.min(existing.quantity + quantity, stockLimit);
                        const updatedItems = [...state.items];
                        updatedItems[existingIndex] = {
                            ...existing,
                            quantity: newQty,
                            product,
                            availableStock: stockLimit,
                        };
                        return { items: updatedItems };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                productId: product.id,
                                quantity: Math.min(quantity, stockLimit),
                                product,
                                selectedSize: selectedSize || product.size || undefined,
                                selectedColor: selectedColor || product.color || undefined,
                                availableStock: stockLimit,
                            },
                        ],
                    };
                });
            },

            removeItem: (productId, selectedSize) => {
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.productId === productId && (selectedSize === undefined || i.selectedSize === selectedSize))
                    ),
                }));
            },

            updateQuantity: (productId, quantity, selectedSize) => {
                if (quantity <= 0) {
                    get().removeItem(productId, selectedSize);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) => {
                        if (i.productId === productId && (selectedSize === undefined || i.selectedSize === selectedSize)) {
                            const maxLimit = i.availableStock ?? 15;
                            return { ...i, quantity: Math.min(quantity, maxLimit) };
                        }
                        return i;
                    }),
                }));
            },

            updateSize: (productId, oldSize, newSize) => {
                if (!newSize || oldSize === newSize) return;
                set((state) => {
                    const target = state.items.find(
                        (i) => i.productId === productId && i.selectedSize === oldSize
                    );
                    if (!target) return state;

                    // If an item with newSize already exists, merge quantities
                    const existingWithNewSize = state.items.find(
                        (i) => i.productId === productId && i.selectedSize === newSize
                    );

                    if (existingWithNewSize) {
                        return {
                            items: state.items
                                .filter((i) => !(i.productId === productId && i.selectedSize === oldSize))
                                .map((i) =>
                                    i.productId === productId && i.selectedSize === newSize
                                        ? { ...i, quantity: i.quantity + target.quantity }
                                        : i
                                ),
                        };
                    }

                    return {
                        items: state.items.map((i) =>
                            i.productId === productId && i.selectedSize === oldSize
                                ? { ...i, selectedSize: newSize }
                                : i
                        ),
                    };
                });
            },

            clearCart: () => set({ items: [], appliedPromo: null }),

            saveForLater: (productId, selectedSize) => {
                const itemToSave = get().items.find(
                    (i) => i.productId === productId && (selectedSize === undefined || i.selectedSize === selectedSize)
                );
                if (!itemToSave) return;

                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.productId === productId && (selectedSize === undefined || i.selectedSize === selectedSize))
                    ),
                    savedForLater: [
                        ...state.savedForLater.filter(
                            (i) => !(i.productId === productId && (selectedSize === undefined || i.selectedSize === selectedSize))
                        ),
                        itemToSave,
                    ],
                }));
            },

            moveToCart: (productId, selectedSize) => {
                const itemToMove = get().savedForLater.find(
                    (i) => i.productId === productId && (selectedSize === undefined || i.selectedSize === selectedSize)
                );
                if (!itemToMove) return;

                set((state) => ({
                    savedForLater: state.savedForLater.filter(
                        (i) => !(i.productId === productId && (selectedSize === undefined || i.selectedSize === selectedSize))
                    ),
                }));
                get().addItem(itemToMove.product, itemToMove.quantity, itemToMove.selectedSize, itemToMove.selectedColor);
            },

            removeSavedItem: (productId, selectedSize) => {
                set((state) => ({
                    savedForLater: state.savedForLater.filter(
                        (i) => !(i.productId === productId && (selectedSize === undefined || i.selectedSize === selectedSize))
                    ),
                }));
            },

            applyPromoCode: (code) => {
                const normalized = code.trim().toUpperCase();
                const promo = PROMO_CODES[normalized];
                if (!promo) {
                    return { success: false, message: 'Invalid promo code. Try SAVE10, WELCOME20, or FREESHIP.' };
                }
                set({ appliedPromo: promo });
                return { success: true, message: `Promo code "${promo.code}" applied: ${promo.description}!` };
            },

            removePromoCode: () => set({ appliedPromo: null }),

            revalidateItems: (freshProducts) => {
                let updatedPrices = 0;
                let outOfStockCount = 0;
                const productMap = new Map(freshProducts.map((p) => [p.id, p]));

                set((state) => ({
                    items: state.items.map((item) => {
                        const fresh = productMap.get(item.productId);
                        if (!fresh) return item;

                        if (fresh.price !== item.product.price) {
                            updatedPrices++;
                        }
                        if (!fresh.inStock) {
                            outOfStockCount++;
                        }

                        return {
                            ...item,
                            product: fresh,
                            availableStock: fresh.inStock ? 15 : 0,
                        };
                    }),
                    savedForLater: state.savedForLater.map((item) => {
                        const fresh = productMap.get(item.productId);
                        return fresh ? { ...item, product: fresh } : item;
                    }),
                }));

                return { updatedPrices, outOfStockCount };
            },

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            subtotal: () =>
                Math.round(get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0) * 100) / 100,

            discountAmount: () => {
                const sub = get().subtotal();
                const promo = get().appliedPromo;
                if (!promo || promo.discountPercent <= 0) return 0;
                return Math.round((sub * (promo.discountPercent / 100)) * 100) / 100;
            },

            shippingFee: () => {
                const sub = get().subtotal();
                if (sub <= 0) return 0;
                const promo = get().appliedPromo;
                if (promo?.freeShipping || sub >= FREE_SHIPPING_THRESHOLD) {
                    return 0;
                }
                return STANDARD_SHIPPING_FEE;
            },

            finalTotal: () => {
                const sub = get().subtotal();
                if (sub <= 0) return 0;
                const disc = get().discountAmount();
                const ship = get().shippingFee();
                return Math.round(Math.max(0, sub - disc + ship) * 100) / 100;
            },

            totalPrice: () => get().finalTotal(), // For checkout / payment backward compatibility

            freeShippingRemaining: () => Math.max(0, Math.round((FREE_SHIPPING_THRESHOLD - get().subtotal()) * 100) / 100),

            freeShippingProgress: () =>
                Math.min(100, Math.round((get().subtotal() / FREE_SHIPPING_THRESHOLD) * 100)),

            toOrderItems: () =>
                get().items.map((i) => ({ productId: i.productId, quantity: i.quantity })),

            syncToBackend: async (userId) => {
                if (!userId) return;
                try {
                    const payload = {
                        items: get().items.map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                            selectedSize: i.selectedSize,
                            selectedColor: i.selectedColor,
                        })),
                    };
                    await syncUserCart(payload, userId);
                } catch {
                    // Silently fail if network is offline; localStorage is source of truth during offline
                }
            },

            loadFromBackend: async (userId, catalogProducts) => {
                if (!userId) return;
                try {
                    const backendItems = await fetchUserCart(userId);
                    if (!backendItems || backendItems.length === 0) return;

                    const catalogMap = new Map(catalogProducts.map((p) => [p.id, p]));
                    const mergedItems: CartItem[] = [];

                    for (const bi of backendItems) {
                        const product = catalogMap.get(bi.productId);
                        if (product) {
                            mergedItems.push({
                                productId: bi.productId,
                                quantity: bi.quantity,
                                product,
                                selectedSize: bi.selectedSize,
                                selectedColor: bi.selectedColor,
                                availableStock: product.inStock ? 15 : 0,
                            });
                        }
                    }

                    if (mergedItems.length > 0) {
                        set({ items: mergedItems });
                    }
                } catch {
                    // Fallback to existing local state
                }
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);