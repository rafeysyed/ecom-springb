import { ShoppingBag } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { CartItem } from '@/features/cart/components/CartItem';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/features/cart/hooks/useCart';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';

export function CartPage() {
    const { items, updateQuantity, removeItem, totalItems, totalPrice, isEmpty } = useCart();

    if (isEmpty) {
        return (
            <PageContainer>
                <EmptyState
                    icon={<ShoppingBag size={24} />}
                    title="Your cart is empty"
                    description="Looks like you haven't added anything yet."
                    action={
                        <Link to="/products">
                            <Button>Start shopping</Button>
                        </Link>
                    }
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <h1 className="text-2xl font-semibold text-text mb-6">Your Cart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card padding="lg">
                        {items.map((item) => (
                            <CartItem
                                key={item.productId}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                            />
                        ))}
                    </Card>
                </div>

                <div>
                    <CartSummary totalItems={totalItems} totalPrice={totalPrice} />
                </div>
            </div>
        </PageContainer>
    );
}