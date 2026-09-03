import { Link } from 'react-router-dom';
import { Package, TrendingUp, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/feedback/LoadingState';
import { formatCurrency } from '@/utils/formatCurrency';
import { useAdminOrders } from '@/features/admin/hooks/useAdmin';
import { useProducts } from '@/features/products/hooks/useProducts';

export function AdminDashboardPage() {
    const { data: orders, isLoading: ordersLoading } = useAdminOrders();
    const { data: products, isLoading: productsLoading } = useProducts();

    if (ordersLoading || productsLoading) {
        return <LoadingState label="Loading admin metrics..." />;
    }

    const totalOrders = orders?.length || 0;
    const paidOrders = orders?.filter((o) => o.status === 'PAID') || [];
    const shippedOrders = orders?.filter((o) => o.status === 'SHIPPED') || [];
    const deliveredOrders = orders?.filter((o) => o.status === 'DELIVERED') || [];

    const totalRevenue = (orders || [])
        .filter((o) => ['PAID', 'SHIPPED', 'DELIVERED'].includes(o.status))
        .reduce((sum, o) => sum + (o.totalAmount ?? o.totalPrice ?? 0), 0);

    const pendingFulfillment = paidOrders.length;

    return (
        <div className="flex flex-col gap-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card padding="md" className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-text-muted">
                        <span className="text-xs font-medium">Total Gross Revenue</span>
                        <TrendingUp size={16} className="text-success" />
                    </div>
                    <p className="text-2xl font-bold text-text mt-1">{formatCurrency(totalRevenue)}</p>
                    <span className="text-[11px] text-text-subtle">Completed & in-transit orders</span>
                </Card>

                <Card padding="md" className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-text-muted">
                        <span className="text-xs font-medium">Total Orders</span>
                        <Package size={16} className="text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-text mt-1">{totalOrders}</p>
                    <span className="text-[11px] text-text-subtle">
                        {deliveredOrders.length} delivered · {shippedOrders.length} in transit
                    </span>
                </Card>

                <Card padding="md" className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-text-muted">
                        <span className="text-xs font-medium">Awaiting Dispatch</span>
                        <AlertCircle size={16} className={pendingFulfillment > 0 ? 'text-warning' : 'text-text-subtle'} />
                    </div>
                    <p className="text-2xl font-bold text-text mt-1">{pendingFulfillment}</p>
                    <span className="text-[11px] text-text-subtle">Paid & ready to ship</span>
                </Card>

                <Card padding="md" className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-text-muted">
                        <span className="text-xs font-medium">Total Catalog Items</span>
                        <ShoppingBag size={16} className="text-secondary" />
                    </div>
                    <p className="text-2xl font-bold text-text mt-1">{products?.length || 0}</p>
                    <span className="text-[11px] text-text-subtle">Active Redis cached products</span>
                </Card>
            </div>

            {/* Quick Actions & Recent Orders Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card padding="lg" className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-text uppercase tracking-wide">
                            Recent Order Stream
                        </h2>
                        <Link
                            to="/admin/orders"
                            className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1"
                        >
                            View All <ArrowRight size={13} />
                        </Link>
                    </div>

                    <div className="flex flex-col divide-y divide-border/60">
                        {(orders || []).slice(0, 5).map((order) => (
                            <div key={order.orderId} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-xs font-mono font-bold text-text">#{order.orderId.slice(0, 8)}</p>
                                    <span className="text-[11px] text-text-muted">
                                        {(order.items || []).length} items · Status: {order.status}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-text">
                                    {formatCurrency(order.totalAmount ?? order.totalPrice ?? 0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card padding="lg" className="flex flex-col justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-text uppercase tracking-wide mb-2">
                            Quick Operations
                        </h2>
                        <p className="text-xs text-text-muted leading-relaxed">
                            Manage order fulfillment lifecycles (advance from Paid to Shipped and Delivered) or add new products to test Redis cache invalidation.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Link to="/admin/orders">
                            <button className="w-full py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2">
                                <Package size={15} />
                                Manage Order Fulfillment
                            </button>
                        </Link>
                        <Link to="/admin/products">
                            <button className="w-full py-2.5 px-4 rounded-xl bg-surface-muted text-text text-xs font-medium hover:bg-border transition-colors flex items-center justify-center gap-2">
                                <ShoppingBag size={15} />
                                View Inventory Catalog
                            </button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
