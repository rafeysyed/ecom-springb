import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import { formatCurrency } from '@/utils/formatCurrency';
import { useOrder } from '@/features/orders/hooks/useOrder';

export function OrderTrackingPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const { data: order, isLoading, isError, refetch } = useOrder(orderId);

    if (isLoading) {
        return (
            <PageContainer>
                <LoadingState label="Loading order…" />
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

    return (
        <PageContainer className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-text">
                        Order #{order.orderId.slice(0, 8)}
                    </h1>
                    <p className="text-sm text-text-muted mt-1">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} items · {formatCurrency(order.totalPrice)}
                    </p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <Card padding="lg" className="mb-6">
                <OrderTimeline status={order.status} />
            </Card>

            <Card padding="lg">
                <h2 className="text-sm font-semibold text-text uppercase tracking-wide mb-4">
                    Items
                </h2>
                <div className="flex flex-col gap-3">
                    {order.items.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm">
                            <span className="text-text-muted">
                                Product {item.productId.slice(0, 8)} × {item.quantity}
                            </span>
                            <span className="font-medium text-text">
                                {formatCurrency(item.price * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </PageContainer>
    );
}