import { Minus, Plus, X, Bookmark, AlertCircle } from 'lucide-react';
import type { CartItem as CartItemType } from '@/features/cart/cartStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { parseAvailableSizes } from '@/api/types/product.types';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
    onRemove: (productId: string, selectedSize?: string) => void;
    onSaveForLater?: (productId: string, selectedSize?: string) => void;
    onUpdateSize?: (productId: string, oldSize?: string, newSize?: string) => void;
}

export function CartItem({
    item,
    onUpdateQuantity,
    onRemove,
    onSaveForLater,
    onUpdateSize,
}: CartItemProps) {
    const { product, quantity, selectedSize, selectedColor } = item;
    const lineTotal = product.price * quantity;
    const maxStock = item.availableStock ?? (product.inStock ? 15 : 0);
    const isAtMaxStock = quantity >= maxStock;
    const availableSizes = parseAvailableSizes(product);

    return (
        <div className="flex gap-4 py-4 border-b border-border last:border-none group transition-all">
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-muted shrink-0 border border-border/50">
                <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Info & Actions */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                                {product.brand}
                            </span>
                            <h4 className="text-sm font-medium text-text truncate" title={product.name}>
                                {product.name}
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemove(product.id, selectedSize)}
                            className="text-text-muted hover:text-danger p-1 rounded transition-colors"
                            aria-label="Remove item"
                            title="Remove from cart"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Variant details (Size / Color) */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-text-muted">
                        {availableSizes.length > 1 && onUpdateSize ? (
                            <div className="flex items-center gap-1">
                                <span>Size:</span>
                                <select
                                    value={selectedSize || availableSizes[0]}
                                    onChange={(e) => onUpdateSize(product.id, selectedSize, e.target.value)}
                                    className="bg-surface-muted text-text font-medium text-xs px-2 py-0.5 rounded border border-border focus:outline-none focus:border-primary"
                                >
                                    {availableSizes.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : selectedSize ? (
                            <span>
                                Size: <strong className="text-text font-medium">{selectedSize}</strong>
                            </span>
                        ) : null}

                        {selectedColor && (
                            <span>
                                Color: <strong className="text-text font-medium">{selectedColor}</strong>
                            </span>
                        )}

                        {!product.inStock && (
                            <span className="text-danger font-semibold flex items-center gap-1">
                                <AlertCircle size={12} /> Out of stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Quantity Controls & Price */}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-surface-muted rounded-lg p-0.5 border border-border">
                            <button
                                type="button"
                                onClick={() => onUpdateQuantity(product.id, quantity - 1, selectedSize)}
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface transition-colors text-text-muted hover:text-text"
                                aria-label="Decrease quantity"
                            >
                                <Minus size={13} />
                            </button>
                            <span className="w-7 text-center text-xs font-semibold text-text">{quantity}</span>
                            <button
                                type="button"
                                disabled={isAtMaxStock || !product.inStock}
                                onClick={() => onUpdateQuantity(product.id, quantity + 1, selectedSize)}
                                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                                    isAtMaxStock || !product.inStock
                                        ? 'text-text-muted/40 cursor-not-allowed'
                                        : 'hover:bg-surface text-text-muted hover:text-text'
                                }`}
                                aria-label="Increase quantity"
                                title={isAtMaxStock ? `Max available stock (${maxStock}) reached` : 'Increase quantity'}
                            >
                                <Plus size={13} />
                            </button>
                        </div>

                        {onSaveForLater && (
                            <button
                                type="button"
                                onClick={() => onSaveForLater(product.id, selectedSize)}
                                className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1"
                                title="Save this item for later"
                            >
                                <Bookmark size={13} />
                                <span className="hidden sm:inline">Save for later</span>
                            </button>
                        )}
                    </div>

                    <div className="text-right">
                        {isAtMaxStock && (
                            <span className="text-[10px] text-amber-500 font-medium block">
                                Max stock ({maxStock})
                            </span>
                        )}
                        <span className="text-sm font-bold text-text">
                            {formatCurrency(lineTotal, product.currency)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}