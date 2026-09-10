import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Banknote, AlertCircle, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCart } from '@/features/cart/hooks/useCart';
import { usePlaceOrder } from '@/features/orders/hooks/usePlaceOrder';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { processPayment, confirm3ds } from '@/api/endpoints/payments';
import type { PaymentMethod } from '@/api/types/payment.types';
import { ThreeDSecureModal } from '@/features/orders/components/ThreeDSecureModal';

export function CheckoutPage() {
    const {
        items,
        totalItems,
        subtotal,
        discountAmount,
        shippingFee,
        finalTotal,
        totalPrice,
        appliedPromo,
        toOrderItems,
        clearCart,
    } = useCart();
    const userId = useAuthStore((s) => s.userId);
    const { mutateAsync: submitOrder, isPending: isOrderPending } = usePlaceOrder();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
    const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
    const [cardExpiry, setCardExpiry] = useState('12/28');
    const [cardCvv, setCardCvv] = useState('123');
    const [cardHolder, setCardHolder] = useState('Test Customer');
    const [vpa, setVpa] = useState('success@upi');

    // 3DS Modal & Payment flow state
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [isThreeDsOpen, setIsThreeDsOpen] = useState(false);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [threeDsError, setThreeDsError] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Quick test card selector
    const applyCardPreset = (num: string, label: string) => {
        setCardNumber(num);
        setPaymentError(null);
        showToast(`Loaded test preset: ${label}`, 'info');
    };

    const handleCheckout = async () => {
        if (!userId) return;
        setPaymentError(null);
        setIsPaymentProcessing(true);

        try {
            // Step 1: Create Order in orderservice (holds inventory)
            const order = await submitOrder({ userId, items: toOrderItems() });
            const orderId = order.orderId;
            setActiveOrderId(orderId);

            // Step 2: Process Payment via paymentservice
            const paymentResult = await processPayment({
                orderId,
                userId,
                amount: totalPrice,
                currency: 'USD',
                paymentMethod,
                cardNumber: cardNumber.replace(/\s+/g, ''),
                cardExpiry,
                cvv: cardCvv,
                cardHolderName: cardHolder,
                vpa: paymentMethod === 'UPI' ? vpa : undefined,
                idempotencyKey: `IDEM_${orderId}_${Date.now()}`,
            });

            // Step 3: Handle Result
            if (paymentResult.status === 'SUCCESS') {
                clearCart();
                showToast('Payment successful! Your order has been placed.', 'success');
                navigate(`/orders/${orderId}/confirmation`);
            } else if (paymentResult.status === 'REQUIRES_ACTION') {
                setIsThreeDsOpen(true);
            } else {
                setPaymentError(paymentResult.message || `Payment ${paymentResult.status}: ${paymentResult.failureReason || 'Declined'}`);
                showToast(`Payment failed: ${paymentResult.failureReason || 'Declined'}`, 'error');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Payment processing error';
            setPaymentError(msg);
            showToast(msg, 'error');
        } finally {
            setIsPaymentProcessing(false);
        }
    };

    const handleConfirm3ds = async (otp: string) => {
        if (!activeOrderId) return;
        setThreeDsError(null);
        setIsPaymentProcessing(true);

        try {
            const res = await confirm3ds({ orderId: activeOrderId, otp });
            if (res.status === 'SUCCESS') {
                setIsThreeDsOpen(false);
                clearCart();
                showToast('3D Secure verified successfully! Order placed.', 'success');
                navigate(`/orders/${activeOrderId}/confirmation`);
            } else {
                setThreeDsError(res.message || 'OTP authentication failed');
            }
        } catch (err: any) {
            setThreeDsError(err.response?.data?.message || 'Authentication error');
        } finally {
            setIsPaymentProcessing(false);
        }
    };

    return (
        <PageContainer className="max-w-3xl">
            <h1 className="text-2xl font-semibold text-text mb-6">Checkout</h1>

            {paymentError && (
                <div className="mb-6 p-4 bg-danger-light border border-danger/30 rounded-xl flex items-start gap-3 text-danger text-sm">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <span className="font-semibold block">Payment Was Not Completed</span>
                        <span>{paymentError}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Left Column: Payment Details */}
                <div className="md:col-span-3 flex flex-col gap-6">
                    <Card padding="lg" className="flex flex-col gap-5">
                        <h2 className="text-sm font-semibold text-text uppercase tracking-wide flex items-center gap-2">
                            <CreditCard size={18} className="text-primary" />
                            Select Payment Method
                        </h2>

                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => { setPaymentMethod('CARD'); setPaymentError(null); }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                                    paymentMethod === 'CARD'
                                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                        : 'border-border text-text-muted hover:border-text-muted/50'
                                }`}
                            >
                                <CreditCard size={20} className="mb-1.5" />
                                Credit/Debit
                            </button>
                            <button
                                type="button"
                                onClick={() => { setPaymentMethod('UPI'); setPaymentError(null); }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                                    paymentMethod === 'UPI'
                                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                        : 'border-border text-text-muted hover:border-text-muted/50'
                                }`}
                            >
                                <Smartphone size={20} className="mb-1.5" />
                                UPI App
                            </button>
                            <button
                                type="button"
                                onClick={() => { setPaymentMethod('COD'); setPaymentError(null); }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                                    paymentMethod === 'COD'
                                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                        : 'border-border text-text-muted hover:border-text-muted/50'
                                }`}
                            >
                                <Banknote size={20} className="mb-1.5" />
                                Pay on Delivery
                            </button>
                        </div>

                        {/* Method 1: Credit / Debit Card Form */}
                        {paymentMethod === 'CARD' && (
                            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                                {/* Quick Test Presets */}
                                <div className="p-3 bg-surface-muted rounded-xl border border-border">
                                    <span className="text-xs font-semibold text-text flex items-center gap-1.5 mb-2">
                                        <Sparkles size={14} className="text-primary" />
                                        Test Card Simulation Presets:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => applyCardPreset('4242 4242 4242 4242', 'Payment Success')}
                                            className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md hover:bg-emerald-500/20"
                                        >
                                            🟢 Success
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyCardPreset('4000 0000 3333 3333', '3D Secure Challenge')}
                                            className="px-2.5 py-1 text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-md hover:bg-amber-500/20"
                                        >
                                            🟡 3D Secure
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyCardPreset('4000 0000 0000 0051', 'Insufficient Funds')}
                                            className="px-2.5 py-1 text-[11px] font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-md hover:bg-rose-500/20"
                                        >
                                            🔴 Insufficient Funds
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyCardPreset('4000 0000 0000 0002', 'Card Declined')}
                                            className="px-2.5 py-1 text-[11px] font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-md hover:bg-rose-500/20"
                                        >
                                            🔴 Declined
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyCardPreset('4000 0000 0000 0004', 'Timeout Simulation')}
                                            className="px-2.5 py-1 text-[11px] font-medium bg-orange-500/10 text-orange-600 border border-orange-500/20 rounded-md hover:bg-orange-500/20"
                                        >
                                            ⏳ Timeout
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyCardPreset('4000 0000 0000 9999', 'Network Retry')}
                                            className="px-2.5 py-1 text-[11px] font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20 rounded-md hover:bg-purple-500/20"
                                        >
                                            ⚡ Network Error
                                        </button>
                                    </div>
                                </div>

                                <Input
                                    label="Card Number"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="4242 4242 4242 4242"
                                    required
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Expiration (MM/YY)"
                                        value={cardExpiry}
                                        onChange={(e) => setCardExpiry(e.target.value)}
                                        placeholder="12/28"
                                        required
                                    />
                                    <Input
                                        label="CVV / CVC"
                                        type="password"
                                        maxLength={4}
                                        value={cardCvv}
                                        onChange={(e) => setCardCvv(e.target.value)}
                                        placeholder="123"
                                        required
                                    />
                                </div>

                                <Input
                                    label="Cardholder Name"
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        )}

                        {/* Method 2: UPI */}
                        {paymentMethod === 'UPI' && (
                            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                                <div className="p-3 bg-surface-muted rounded-xl border border-border">
                                    <span className="text-xs font-semibold text-text block mb-1.5">UPI Simulation Presets:</span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setVpa('success@upi')}
                                            className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md"
                                        >
                                            🟢 success@upi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVpa('insufficient@upi')}
                                            className="px-2.5 py-1 text-xs font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-md"
                                        >
                                            🔴 insufficient@upi
                                        </button>
                                    </div>
                                </div>

                                <Input
                                    label="Virtual Payment Address (UPI ID)"
                                    value={vpa}
                                    onChange={(e) => setVpa(e.target.value)}
                                    placeholder="yourname@okhdfcbank"
                                    required
                                />
                            </div>
                        )}

                        {/* Method 3: COD */}
                        {paymentMethod === 'COD' && (
                            <div className="p-4 bg-surface-muted rounded-xl border border-border text-sm text-text-muted animate-in fade-in duration-200">
                                <p>Pay with cash or UPI directly upon delivery of your package.</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column: Order Review */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    <Card padding="lg" className="flex flex-col gap-4 sticky top-6">
                        <h2 className="text-sm font-semibold text-text uppercase tracking-wide">
                            Order Summary
                        </h2>

                        <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1 divide-y divide-border/40">
                            {items.map((item) => (
                                <div key={`${item.productId}::${item.selectedSize || 'default'}`} className="flex justify-between text-xs pt-2 first:pt-0">
                                    <div className="min-w-0 pr-2">
                                        <span className="text-text truncate block max-w-[170px]" title={item.product.name}>
                                            {item.product.name}
                                        </span>
                                        <span className="text-text-muted text-[11px]">
                                            Qty: {item.quantity}{item.selectedSize ? ` | Size: ${item.selectedSize}` : ''}
                                        </span>
                                    </div>
                                    <span className="font-semibold text-text shrink-0">
                                        {formatCurrency(item.product.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border pt-3 flex flex-col gap-2 text-xs text-text-muted">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-text font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            {appliedPromo && discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Discount ({appliedPromo.code})</span>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span>Shipping</span>
                                {shippingFee === 0 ? (
                                    <span className="text-emerald-600 font-bold uppercase text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        FREE
                                    </span>
                                ) : (
                                    <span className="text-text font-medium">{formatCurrency(shippingFee)}</span>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-border pt-3 flex justify-between text-base font-bold text-text items-baseline">
                            <span>Estimated Total ({totalItems} items)</span>
                            <span className="text-primary text-xl font-bold">{formatCurrency(finalTotal)}</span>
                        </div>

                        <Button
                            size="lg"
                            className="w-full mt-2"
                            isLoading={isOrderPending || isPaymentProcessing}
                            onClick={handleCheckout}
                        >
                            {paymentMethod === 'COD' ? 'Confirm Order' : `Pay ${formatCurrency(finalTotal)}`}
                        </Button>
                    </Card>
                </div>
            </div>

            {/* 3D Secure Verification Modal */}
            <ThreeDSecureModal
                isOpen={isThreeDsOpen}
                orderId={activeOrderId || ''}
                amount={totalPrice}
                isPending={isPaymentProcessing}
                error={threeDsError}
                onConfirm={handleConfirm3ds}
                onCancel={() => {
                    setIsThreeDsOpen(false);
                    setPaymentError('Payment was cancelled during 3D Secure verification.');
                }}
            />
        </PageContainer>
    );
}