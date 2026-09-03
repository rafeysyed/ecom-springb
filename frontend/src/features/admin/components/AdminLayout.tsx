import { NavLink, Outlet } from 'react-router-dom';
import { Package, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

const ADMIN_LINKS = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Orders & Fulfillment', icon: Package },
    { to: '/admin/products', label: 'Product Inventory', icon: ShoppingBag },
];

export function AdminLayout() {
    return (
        <PageContainer className="py-8">
            <div className="flex flex-col gap-6">
                {/* Admin Subheader & Navigation Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-light px-2 py-0.5 rounded-full">
                            Admin Portal
                        </span>
                        <h1 className="text-xl font-bold text-text mt-1">Management Hub</h1>
                    </div>

                    <nav className="flex items-center gap-2 overflow-x-auto">
                        {ADMIN_LINKS.map(({ to, label, icon: Icon, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) => `
                                    flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0
                                    ${isActive
                                        ? 'bg-primary text-white shadow-soft'
                                        : 'text-text-muted hover:text-text hover:bg-surface-muted'
                                    }
                                `}
                            >
                                <Icon size={15} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Main Admin View Content */}
                <Outlet />
            </div>
        </PageContainer>
    );
}
