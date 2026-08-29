import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface CartSummaryProps {
    totalItems: number;
    totalPrice: number;
    checkoutHref?: string;
}

export function CartSummary({ totalItems, totalPrice, checkoutHref = '/checkout' }: CartSummaryProps) {
    return (
        <Card padding="lg" className="flex flex-col gap-4">
            <h3 className="text-base font-semibold text-text">Order Summary</h3>

            <div className="flex justify-between text-sm text-text-muted">
                <span>Items ({totalItems})</span>
                <span>{formatCurrency(totalPrice)}</span>
            </div>

            <div className="flex justify-between text-sm text-text-muted">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
            </div>

            <div className="border-t border-border pt-4 flex justify-between text-base font-semibold text-text">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
            </div>

            <Link to={checkoutHref}>
                <Button className="w-full" disabled={totalItems === 0}>
                    Proceed to Checkout
                </Button>
            </Link>
        </Card>
    );
}