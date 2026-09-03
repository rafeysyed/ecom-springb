import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function AdminRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const roles = useAuthStore((s) => s.roles);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const isAdmin = roles.includes('ROLE_ADMIN');
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
