import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
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
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}