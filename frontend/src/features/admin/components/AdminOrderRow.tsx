import { Check, Truck, XCircle } from 'lucide-react';
import type { Order } from '@/api/types/order.types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useUpdateOrderStatus } from '@/features/admin/hooks/useAdmin';
import { useProducts } from '@/features/products/hooks/useProducts';

interface AdminOrderRowProps {
    order: Order;
}

export function AdminOrderRow({ order }: AdminOrderRowProps) {
    const { data: products } = useProducts();
    const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

    const status = (order.status || 'PENDING').toUpperCase();
    const totalAmount = order.totalAmount ?? order.totalPrice ?? 0;
    const totalItems = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);

    const handleAdvance = (nextStatus: any) => {
        updateStatus({ orderId: order.orderId, status: nextStatus });
    };

    return (
        <Card padding="md" className="flex flex-col gap-4">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-text">#{order.orderId}</span>
                    <OrderStatusBadge status={order.status} />
                </div>
                <div className="text-xs text-text-muted">
                    {order.createdAt ? formatDate(order.createdAt) : 'Recent Order'}
                </div>
            </div>

            {/* Order Items Preview */}
            <div className="flex flex-col gap-2">
                {(order.items || []).map((item, idx) => {
                    const product = products?.find((p) => String(p.id) === String(item.productId));
                    return (
                        <div key={idx} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded bg-surface-muted border border-border overflow-hidden shrink-0">
                                    {product?.mainImage ? (
                                        <img src={product.mainImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-text-subtle">IMG</div>
                                    )}
                                </div>
                                <span className="font-medium text-text truncate max-w-xs">
                                    {product?.name || `Product #${String(item.productId).slice(0, 8)}`}
                                </span>
                                <span className="text-text-muted shrink-0">× {item.quantity}</span>
                            </div>
                            <span className="font-semibold text-text shrink-0">
                                {formatCurrency((item.price ?? product?.price ?? 0) * item.quantity)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Footer Summary & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/60 bg-surface-muted/30 -mx-4 -mb-4 p-4 rounded-b-xl">
                <div className="text-xs text-text-muted">
                    Total: <span className="text-sm font-bold text-text ml-1">{formatCurrency(totalAmount)}</span> ({totalItems} items)
                </div>

                {/* State Machine Transition Actions */}
                <div className="flex items-center gap-2">
                    {status === 'PAID' && (
                        <Button
                            size="sm"
                            isLoading={isPending}
                            onClick={() => handleAdvance('SHIPPED')}
                            className="text-xs"
                        >
                            <Truck size={14} className="mr-1.5" />
                            Dispatch / Mark Shipped
                        </Button>
                    )}

                    {status === 'SHIPPED' && (
                        <Button
                            size="sm"
                            isLoading={isPending}
                            onClick={() => handleAdvance('DELIVERED')}
                            className="bg-success text-white hover:bg-success/90 text-xs"
                        >
                            <Check size={14} className="mr-1.5" />
                            Mark as Delivered
                        </Button>
                    )}

                    {(status === 'CREATED' || status === 'PENDING') && (
                        <span className="text-xs text-text-muted italic flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                            Processing via Kafka Saga...
                        </span>
                    )}

                    {status === 'DELIVERED' && (
                        <span className="text-xs font-semibold text-success flex items-center gap-1">
                            <Check size={14} /> Completed & Delivered
                        </span>
                    )}

                    {status === 'FAILED' && (
                        <span className="text-xs font-semibold text-danger flex items-center gap-1">
                            <XCircle size={14} /> Payment Declined
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
