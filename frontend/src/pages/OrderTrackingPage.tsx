import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import { formatCurrency } from '@/utils/formatCurrency';
import { useOrder } from '@/features/orders/hooks/useOrder';
import { useProducts } from '@/features/products/hooks/useProducts';
import { ArrowLeft } from 'lucide-react';

export function OrderTrackingPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const { data: order, isLoading, isError, refetch } = useOrder(orderId);
    const { data: products } = useProducts();

    if (isLoading) {
        return (
            <PageContainer>
                <LoadingState label="Loading order details…" />
            </PageContainer>
        );
    }

    if (isError || !order) {
        return (
            <PageContainer>
                <ErrorState onRetry={() => refetch()} />
            </PageContainer>
        );
    }

    const totalAmount = order.totalAmount ?? order.totalPrice ?? 0;
    const totalItems = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);

    return (
        <PageContainer className="max-w-2xl">
            <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-4 transition-colors"
            >
                <ArrowLeft size={14} />
                Back to Orders
            </Link>

            {/* Header: One-line Order ID with Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-text font-mono">
                        Order #{order.orderId}
                    </h1>
                    <p className="text-xs text-text-muted mt-1">
                        {totalItems} item{totalItems !== 1 ? 's' : ''} · Total: <span className="font-semibold text-text">{formatCurrency(totalAmount)}</span>
                    </p>
                </div>
                <div className="self-start sm:self-center">
                    <OrderStatusBadge status={order.status} />
                </div>
            </div>

            {/* Timeline */}
            <Card padding="lg" className="mb-6">
                <OrderTimeline status={order.status} />
            </Card>

            {/* Ordered Items with Product Thumbnails and Pricing */}
            <Card padding="lg">
                <h2 className="text-xs font-semibold text-text uppercase tracking-wider mb-4">
                    Order Items
                </h2>
                <div className="flex flex-col divide-y divide-border/60">
                    {(order.items || []).map((item, idx) => {
                        const product = products?.find((p) => String(p.id) === String(item.productId));
                        const itemPrice = item.price ?? product?.price ?? 0;
                        const itemTotal = itemPrice * item.quantity;

                        return (
                            <div key={idx} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
                                <div className="w-14 h-14 rounded-lg bg-surface-muted border border-border/80 overflow-hidden shrink-0">
                                    {product?.mainImage ? (
                                        <img
                                            src={product.mainImage}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-text-subtle">
                                            IMG
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text line-clamp-1">
                                        {product?.name || `Product #${String(item.productId).slice(0, 8)}`}
                                    </p>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        Qty: <span className="font-medium text-text">{item.quantity}</span>
                                        {itemPrice > 0 && ` × ${formatCurrency(itemPrice)}`}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-text shrink-0">
                                    {formatCurrency(itemTotal)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between items-center border-t border-border mt-4 pt-4 text-sm">
                    <span className="font-medium text-text">Total Paid</span>
                    <span className="text-base font-bold text-text">{formatCurrency(totalAmount)}</span>
                </div>
            </Card>
        </PageContainer>
    );
}