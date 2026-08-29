import { Minus, Plus, X } from 'lucide-react';
import type { CartItem as CartItemType } from '@/features/cart/cartStore';
import { formatCurrency } from '@/utils/formatCurrency';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemove: (productId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
    const { product, quantity } = item;
    const lineTotal = product.price * quantity;

    return (
        <div className="flex gap-4 py-4 border-b border-border last:border-none">
            <div className="w-20 h-20 rounded-md overflow-hidden bg-surface-muted shrink-0">
                <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <h4 className="text-sm font-medium text-text line-clamp-1">{product.name}</h4>
                <span className="text-xs text-text-muted">{product.brand}</span>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 bg-surface-muted rounded-sm p-0.5">
                        <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-surface transition-colors text-text-muted"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-surface transition-colors text-text-muted"
                            aria-label="Increase quantity"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <span className="text-sm font-semibold text-text">
                        {formatCurrency(lineTotal, product.currency)}
                    </span>
                </div>
            </div>

            <button
                onClick={() => onRemove(product.id)}
                className="text-text-subtle hover:text-danger transition-colors h-fit"
                aria-label="Remove item"
            >
                <X size={16} />
            </button>
        </div>
    );
}