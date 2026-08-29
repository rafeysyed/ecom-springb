import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCart } from '@/features/cart/hooks/useCart';
import { usePlaceOrder } from '@/features/orders/hooks/usePlaceOrder';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';

export function CheckoutPage() {
    const { items, totalItems, totalPrice, toOrderItems, clearCart } = useCart();
    const userId = useAuthStore((s) => s.userId);
    const { mutate: submitOrder, isPending } = usePlaceOrder();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handlePlaceOrder = () => {
        if (!userId) return;

        submitOrder(
            { userId, items: toOrderItems() },
            {
                onSuccess: (order) => {
                    clearCart();
                    navigate(`/orders/${order.orderId}/confirmation`);
                },
                onError: () => {
                    showToast('Could not place your order. Please try again.', 'error');
                },
            }
        );
    };

    return (
        <PageContainer className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-text mb-6">Checkout</h1>

            <Card padding="lg" className="flex flex-col gap-4 mb-6">
                <h2 className="text-sm font-semibold text-text uppercase tracking-wide">
                    Review Order
                </h2>
                {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-text">
                            {item.product.name} <span className="text-text-muted">× {item.quantity}</span>
                        </span>
                        <span className="font-medium text-text">
                            {formatCurrency(item.product.price * item.quantity)}
                        </span>
                    </div>
                ))}
                <div className="border-t border-border pt-4 flex justify-between text-base font-semibold text-text">
                    <span>Total ({totalItems} items)</span>
                    <span>{formatCurrency(totalPrice)}</span>
                </div>
            </Card>

            <Button size="lg" className="w-full" isLoading={isPending} onClick={handlePlaceOrder}>
                Place Order
            </Button>
        </PageContainer>
    );
}