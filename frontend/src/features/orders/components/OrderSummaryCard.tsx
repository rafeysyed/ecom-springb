import { Link } from 'react-router-dom';
import type { Order } from '@/api/types/order.types';
import { Card } from '@/components/ui/Card';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { formatCurrency } from '@/utils/formatCurrency';

interface OrderSummaryCardProps {
    order: Order;
    /** When true, wraps the card as a link to the tracking page. */
    linkToTracking?: boolean;
}

export function OrderSummaryCard({ order, linkToTracking = true }: OrderSummaryCardProps) {
    const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

    const content = (
        <Card interactive={linkToTracking} padding="md" className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-xs text-text-muted">Order</span>
                    <p className="text-sm font-medium text-text font-mono">
                        #{order.orderId.slice(0, 8)}
                    </p>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <div className="flex items-center justify-between text-sm text-text-muted">
                <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                <span className="font-semibold text-text">{formatCurrency(order.totalPrice)}</span>
            </div>
        </Card>
    );

    if (linkToTracking) {
        return <Link to={`/orders/${order.orderId}`}>{content}</Link>;
    }

    return content;
}