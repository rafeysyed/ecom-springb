import { Sparkles, Plus } from 'lucide-react';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatCurrency } from '@/utils/formatCurrency';
import { useToast } from '@/components/ui/Toast';

interface CartCrossSellProps {
    className?: string;
    maxDisplay?: number;
}

export function CartCrossSell({ className = '', maxDisplay = 3 }: CartCrossSellProps) {
    const { data: products } = useProducts();
    const { items, addItem } = useCart();
    const { showToast } = useToast();

    if (!products || products.length === 0) return null;

    const cartProductIds = new Set(items.map((i) => i.productId));
    const recommendations = products
        .filter((p) => !cartProductIds.has(p.id) && p.inStock)
        .slice(0, maxDisplay);

    if (recommendations.length === 0) return null;

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text uppercase tracking-wide">
                <Sparkles size={14} className="text-primary" />
                Frequently Added Together
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.map((product) => (
                    <div
                        key={product.id}
                        className="p-2.5 rounded-xl border border-border bg-surface-muted/40 hover:bg-surface-muted transition-all flex items-center justify-between gap-2.5"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface shrink-0">
                                <img
                                    src={product.mainImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <h5 className="text-xs font-medium text-text truncate max-w-[120px]">
                                    {product.name}
                                </h5>
                                <span className="text-xs font-bold text-text block">
                                    {formatCurrency(product.price, product.currency)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                addItem(product, 1);
                                showToast(`Added "${product.name}" to cart`, 'success');
                            }}
                            className="p-1.5 rounded-lg border border-primary/20 bg-primary/10 hover:bg-primary hover:text-white text-primary transition-all shrink-0"
                            title="Add to cart"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
