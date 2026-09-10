import { Bookmark, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface SavedForLaterSectionProps {
    className?: string;
}

export function SavedForLaterSection({ className = '' }: SavedForLaterSectionProps) {
    const { savedForLater, moveToCart, removeSavedItem } = useCart();

    if (savedForLater.length === 0) return null;

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <div className="flex items-center gap-2">
                <Bookmark size={18} className="text-primary" />
                <h3 className="text-lg font-semibold text-text">
                    Saved for Later ({savedForLater.length})
                </h3>
            </div>

            <Card padding="md" className="divide-y divide-border">
                {savedForLater.map((item) => (
                    <div
                        key={`${item.productId}::${item.selectedSize || 'default'}`}
                        className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-muted shrink-0">
                                <img
                                    src={item.product.mainImage}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                                    {item.product.brand}
                                </span>
                                <h4 className="text-sm font-medium text-text truncate max-w-xs">
                                    {item.product.name}
                                </h4>
                                {item.selectedSize && (
                                    <span className="text-xs text-text-muted">
                                        Size: <strong className="text-text">{item.selectedSize}</strong>
                                    </span>
                                )}
                                <span className="text-sm font-bold text-text block mt-0.5">
                                    {formatCurrency(item.product.price, item.product.currency)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => moveToCart(item.productId, item.selectedSize)}
                                className="flex items-center gap-1.5"
                            >
                                <ShoppingBag size={14} />
                                Move to Cart
                            </Button>
                            <button
                                type="button"
                                onClick={() => removeSavedItem(item.productId, item.selectedSize)}
                                className="p-2 text-text-muted hover:text-danger rounded-lg hover:bg-surface-muted transition-colors"
                                title="Remove saved item"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </Card>
        </div>
    );
}
