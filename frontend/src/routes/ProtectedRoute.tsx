import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Wraps a set of routes that require authentication. Nearly every endpoint
 * except register/login needs a bearer token, so this guards those pages
 * and bounces unauthenticated users to /login, remembering where they were
 * headed via location state so LoginPage can redirect back after success.
 */
export function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}