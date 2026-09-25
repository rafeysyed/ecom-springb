import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Order } from '@/api/types/order.types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { CancelOrderModal } from '@/features/orders/components/CancelOrderModal';
import { formatCurrency } from '@/utils/formatCurrency';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCancelOrder } from '@/features/orders/hooks/useCancelOrder';
import { useToast } from '@/components/ui/Toast';
import { Ban, Compass } from 'lucide-react';

interface OrderSummaryCardProps {
    order: Order;
    linkToTracking?: boolean;
}

export function OrderSummaryCard({ order, linkToTracking = true }: OrderSummaryCardProps) {
    const navigate = useNavigate();
    const { data: products } = useProducts();
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
    const { showToast } = useToast();
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const totalItems = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);
    const amount = order.totalAmount ?? order.totalPrice ?? 0;

    const isCancellable = ['PAID', 'CREATED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'CONFIRMED'].includes(
        order.status?.toUpperCase()
    );

    const handleConfirmCancel = () => {
        cancelOrder(order.orderId, {
            onSuccess: () => {
                showToast('Order cancelled successfully. Items have been restocked.', 'success');
                setIsCancelModalOpen(false);
            },
            onError: (err: any) => {
                showToast(err?.response?.data?.message || 'Failed to cancel order.', 'error');
            },
        });
    };

    // Find product images for each item in this order
    const itemProducts = (order.items || []).map((item) => {
        const prod = products?.find((p) => String(p.id) === String(item.productId));
        return {
            ...item,
            image: prod?.mainImage,
            name: prod?.name || `Product #${String(item.productId).slice(0, 8)}`,
        };
    });

    return (
        <>
            <Card padding="md" className="flex flex-col gap-3.5 hover:shadow-soft-hover transition-all">
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
                    <div
                        className="flex items-center gap-2 overflow-x-auto py-1 cursor-pointer"
                        onClick={() => linkToTracking && navigate(`/orders/${order.orderId}`)}
                    >
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

                {/* Footer Summary & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-muted border-t border-border/60 pt-3">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                        <span className="text-sm font-semibold text-text">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        {isCancellable && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsCancelModalOpen(true);
                                }}
                                className="text-danger hover:text-danger hover:border-danger/40 border-border text-xs gap-1.5 h-8 px-2.5"
                            >
                                <Ban size={12} />
                                Cancel
                            </Button>
                        )}
                        {linkToTracking && (
                            <Link to={`/orders/${order.orderId}`}>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="text-xs gap-1.5 h-8 px-3"
                                >
                                    <Compass size={13} />
                                    Track Order
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </Card>

            <CancelOrderModal
                isOpen={isCancelModalOpen}
                orderId={order.orderId}
                isPending={isCancelling}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
            />
        </>
    );
}