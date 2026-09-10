import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCart } from '@/features/cart/hooks/useCart';
import { FreeShippingBar } from '@/features/cart/components/FreeShippingBar';
import { PromoCodeBox } from '@/features/cart/components/PromoCodeBox';

interface CartSummaryProps {
    checkoutHref?: string;
    showPromoBox?: boolean;
    showShippingBar?: boolean;
}

export function CartSummary({
    checkoutHref = '/checkout',
    showPromoBox = true,
    showShippingBar = true,
}: CartSummaryProps) {
    const {
        items,
        totalItems,
        subtotal,
        discountAmount,
        shippingFee,
        finalTotal,
        appliedPromo,
    } = useCart();

    const hasOutOfStockItems = items.some((i) => !i.product.inStock);

    return (
        <Card padding="lg" className="flex flex-col gap-5 sticky top-20 shadow-xs">
            <h3 className="text-base font-semibold text-text">Order Summary</h3>

            {/* Free Shipping Tracker */}
            {showShippingBar && <FreeShippingBar />}

            {/* Financial Breakdown */}
            <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between text-text-muted">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="text-text font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {appliedPromo && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                        <span className="flex items-center gap-1">
                            <Sparkles size={13} />
                            Discount ({appliedPromo.code})
                        </span>
                        <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                )}

                <div className="flex justify-between text-text-muted items-center">
                    <span>Estimated Shipping</span>
                    {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            FREE
                        </span>
                    ) : (
                        <span className="text-text font-medium">{formatCurrency(shippingFee)}</span>
                    )}
                </div>

                <div className="border-t border-border pt-3 mt-1 flex justify-between text-base font-bold text-text items-baseline">
                    <span>Estimated Total</span>
                    <span className="text-xl text-primary font-bold">{formatCurrency(finalTotal)}</span>
                </div>
            </div>

            {/* Promo Code Input */}
            {showPromoBox && <PromoCodeBox />}

            {/* Checkout Action */}
            <div className="flex flex-col gap-2 pt-2">
                <Link to={checkoutHref}>
                    <Button
                        className="w-full flex items-center justify-center gap-2"
                        size="lg"
                        disabled={totalItems === 0 || hasOutOfStockItems}
                    >
                        Proceed to Checkout
                        <ArrowRight size={16} />
                    </Button>
                </Link>

                {hasOutOfStockItems && (
                    <span className="text-xs text-danger text-center">
                        Please remove out-of-stock items before checkout.
                    </span>
                )}
            </div>

            {/* Trust & Guarantees */}
            <div className="border-t border-border pt-4 flex flex-col gap-2 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                    <span>256-Bit SSL Encrypted & Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>30-Day Hassle-Free Returns Guaranteed</span>
                </div>
            </div>
        </Card>
    );
}