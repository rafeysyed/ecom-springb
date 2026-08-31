import { Badge } from '@/components/ui/Badge';
import type { OrderStatus } from '@/api/types/order.types';

interface OrderStatusBadgeProps {
    status?: OrderStatus;
}

const STATUS_TONE: Record<string, 'pending' | 'confirmed' | 'shipped' | 'cancelled'> = {
    CREATED: 'pending',
    PENDING: 'pending',
    PAYMENT_PENDING: 'pending',
    PAYMENT_COMPLETED: 'confirmed',
    PAID: 'confirmed',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    DELIVERED: 'confirmed',
    FAILED: 'cancelled',
    CANCELLED: 'cancelled',
};

const STATUS_LABEL: Record<string, string> = {
    CREATED: 'Processing',
    PENDING: 'Pending',
    PAYMENT_PENDING: 'Payment Pending',
    PAYMENT_COMPLETED: 'Paid',
    PAID: 'Paid',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const rawStatus = (status || 'PENDING').toUpperCase();
    const tone = STATUS_TONE[rawStatus] || 'pending';
    const label = STATUS_LABEL[rawStatus] || rawStatus;

    return <Badge tone={tone}>{label}</Badge>;
}