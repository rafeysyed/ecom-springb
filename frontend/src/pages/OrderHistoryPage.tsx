import { PageContainer } from '@/components/layout/PageContainer';
import { ErrorState } from '@/components/feedback/ErrorState';
import { OrderHistoryList } from '@/features/orders/components/OrderHistoryList';
import { useOrderHistory } from '@/features/orders/hooks/useOrderHistory';
import { useAuthStore } from '@/store/authStore';

export function OrderHistoryPage() {
    const userId = useAuthStore((s) => s.userId);
    const { data: orders, isLoading, isError, refetch } = useOrderHistory(userId);

    return (
        <PageContainer className="max-w-2xl">
            <h1 className="text-xl font-semibold text-text mb-5">Your Orders</h1>

            {isError ? (
                <ErrorState onRetry={() => refetch()} />
            ) : (
                <OrderHistoryList orders={orders ?? []} isLoading={isLoading} />
            )}
        </PageContainer>
    );
}