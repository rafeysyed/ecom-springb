import { Badge } from '@/components/ui/Badge';
import type { OrderStatus } from '@/api/types/order.types';

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

const STATUS_TONE: Record<OrderStatus, 'pending' | 'confirmed' | 'shipped' | 'cancelled'> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    DELIVERED: 'confirmed',
    CANCELLED: 'cancelled',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}