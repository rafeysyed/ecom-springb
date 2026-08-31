import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';
import { useOrder } from '@/features/orders/hooks/useOrder';

export function OrderConfirmationPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const { data: order, isLoading, isError, refetch } = useOrder(orderId);

    if (isLoading) {
        return (
            <PageContainer>
                <LoadingState label="Loading your order…" />
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

    const total = order.totalAmount ?? order.totalPrice ?? 0;

    return (
        <PageContainer className="max-w-lg text-center">
            <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-5 text-success">
                <CheckCircle2 size={32} />
            </div>

            <h1 className="text-2xl font-semibold text-text mb-2">Order placed!</h1>
            <p className="text-sm text-text-muted mb-6">
                Thanks for your order — we'll keep you posted on its status.
            </p>

            <Card padding="lg" className="text-left flex flex-col gap-3 mb-6">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Order ID</span>
                    <span className="text-xs font-mono text-text font-semibold">#{order.orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Status</span>
                    <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm font-semibold text-text">Total</span>
                    <span className="text-sm font-semibold text-text">
                        {formatCurrency(total)}
                    </span>
                </div>
            </Card>

            <div className="flex gap-3">
                <Link to={`/orders/${order.orderId}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                        Track Order
                    </Button>
                </Link>
                <Link to="/products" className="flex-1">
                    <Button className="w-full">Continue Shopping</Button>
                </Link>
            </div>
        </PageContainer>
    );
}