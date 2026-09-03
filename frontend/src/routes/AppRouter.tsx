import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary';

import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { HomePage } from '@/pages/HomePage';
import { ProductListPage } from '@/pages/ProductListPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
import { OrderTrackingPage } from '@/pages/OrderTrackingPage';
import { OrderHistoryPage } from '@/pages/OrderHistoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Admin Pages
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { AdminOrdersPage } from '@/features/admin/pages/AdminOrdersPage';
import { AdminProductsPage } from '@/features/admin/pages/AdminProductsPage';

const router = createBrowserRouter([
    {
        element: <AppLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
            { path: '/', element: <HomePage /> },
            { path: '/products', element: <ProductListPage /> },
            { path: '/products/:id', element: <ProductDetailPage /> },
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            {
                element: <ProtectedRoute />,
                children: [
                    { path: '/cart', element: <CartPage /> },
                    { path: '/checkout', element: <CheckoutPage /> },
                    { path: '/orders', element: <OrderHistoryPage /> },
                    { path: '/orders/:orderId', element: <OrderTrackingPage /> },
                    { path: '/orders/:orderId/confirmation', element: <OrderConfirmationPage /> },
                    { path: '/profile', element: <ProfilePage /> },
                ],
            },
            {
                element: <AdminRoute />,
                children: [
                    {
                        path: '/admin',
                        element: <AdminLayout />,
                        children: [
                            { index: true, element: <AdminDashboardPage /> },
                            { path: 'orders', element: <AdminOrdersPage /> },
                            { path: 'products', element: <AdminProductsPage /> },
                        ],
                    },
                ],
            },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}