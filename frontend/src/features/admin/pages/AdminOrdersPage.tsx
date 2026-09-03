import { useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AdminOrderRow } from '@/features/admin/components/AdminOrderRow';
import { useAdminOrders } from '@/features/admin/hooks/useAdmin';

const STATUS_FILTERS: { label: string; value: string }[] = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Paid (Awaiting Dispatch)', value: 'PAID' },
    { label: 'Shipped (In Transit)', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Failed / Cancelled', value: 'FAILED' },
];

export function AdminOrdersPage() {
    const { data: orders, isLoading } = useAdminOrders();
    const [statusFilter, setStatusFilter] = useState('ALL');

    if (isLoading) {
        return <LoadingState label="Loading all customer orders..." />;
    }

    const allOrders = orders || [];
    const filteredOrders = statusFilter === 'ALL'
        ? allOrders
        : allOrders.filter((o) => {
            if (statusFilter === 'FAILED') return o.status === 'FAILED' || o.status === 'CANCELLED';
            return o.status === statusFilter;
        });

    return (
        <div className="flex flex-col gap-5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                            statusFilter === f.value
                                ? 'bg-text text-surface font-semibold shadow-soft'
                                : 'bg-surface text-text-muted border border-border hover:text-text'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <EmptyState
                    icon={<PackageSearch size={28} />}
                    title="No matching orders"
                    description={`There are currently no orders with status filter "${statusFilter}".`}
                />
            ) : (
                <div className="flex flex-col gap-3.5">
                    {filteredOrders.map((order) => (
                        <AdminOrderRow key={order.orderId} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
