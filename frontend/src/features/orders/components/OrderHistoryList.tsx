import { PackageSearch } from 'lucide-react';
import type { Order } from '@/api/types/order.types';
import { OrderSummaryCard } from '@/features/orders/components/OrderSummaryCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface OrderHistoryListProps {
    orders: Order[];
    isLoading?: boolean;
}

export function OrderHistoryList({ orders, isLoading = false }: OrderHistoryListProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <EmptyState
                icon={<PackageSearch size={24} />}
                title="No orders yet"
                description="Your past orders will show up here once you place one."
            />
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {orders.map((order) => (
                <OrderSummaryCard key={order.orderId} order={order} />
            ))}
        </div>
    );
}