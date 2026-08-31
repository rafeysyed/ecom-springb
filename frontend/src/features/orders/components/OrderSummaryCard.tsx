import { Link } from 'react-router-dom';
import type { Order } from '@/api/types/order.types';
import { Card } from '@/components/ui/Card';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { useProducts } from '@/features/products/hooks/useProducts';

interface OrderSummaryCardProps {
    order: Order;
    linkToTracking?: boolean;
}

export function OrderSummaryCard({ order, linkToTracking = true }: OrderSummaryCardProps) {
    const { data: products } = useProducts();
    const totalItems = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);
    const amount = order.totalAmount ?? order.totalPrice ?? 0;

    // Find product images for each item in this order
    const itemProducts = (order.items || []).map((item) => {
        const prod = products?.find((p) => String(p.id) === String(item.productId));
        return {
            ...item,
            image: prod?.mainImage,
            name: prod?.name || `Product #${String(item.productId).slice(0, 8)}`,
        };
    });

    const content = (
        <Card interactive={linkToTracking} padding="md" className="flex flex-col gap-3.5 hover:shadow-soft-hover transition-all">
            {/* Header: Order ID in one line, Status Badge */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-text-muted shrink-0">Order:</span>
                    <span className="text-xs font-semibold text-text font-mono truncate" title={order.orderId}>
                        #{order.orderId}
                    </span>
                </div>
                <div className="shrink-0">
                    <OrderStatusBadge status={order.status} />
                </div>
            </div>

            {/* Product Thumbnails Preview: One image of each product in the order */}
            {itemProducts.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {itemProducts.map((item, idx) => (
                        <div
                            key={idx}
                            className="w-14 h-14 rounded-lg bg-surface-muted border border-border/80 overflow-hidden shrink-0 relative group"
                            title={`${item.name} (${item.quantity}x)`}
                        >
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-text-subtle font-mono">
                                    IMG
                                </div>
                            )}
                            {item.quantity > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 bg-surface/90 text-text text-[9px] font-bold px-1 rounded-sm shadow-soft">
                                    ×{item.quantity}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Summary */}
            <div className="flex items-center justify-between text-xs text-text-muted border-t border-border/60 pt-2.5">
                <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                <span className="text-sm font-semibold text-text">{formatCurrency(amount)}</span>
            </div>
        </Card>
    );

    if (linkToTracking) {
        return <Link to={`/orders/${order.orderId}`} className="block">{content}</Link>;
    }

    return content;
}