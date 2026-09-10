import { Truck, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCart } from '@/features/cart/hooks/useCart';

interface FreeShippingBarProps {
    className?: string;
}

export function FreeShippingBar({ className = '' }: FreeShippingBarProps) {
    const { freeShippingRemaining, freeShippingProgress, appliedPromo, items } = useCart();

    if (items.length === 0) return null;

    const isUnlocked = freeShippingRemaining === 0 || appliedPromo?.freeShipping;

    return (
        <div className={`p-3.5 rounded-xl border transition-all ${
            isUnlocked
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                : 'bg-primary/5 border-primary/20 text-text'
        } ${className}`}>
            <div className="flex items-center gap-2 mb-2">
                {isUnlocked ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                ) : (
                    <Truck size={16} className="text-primary shrink-0" />
                )}
                <span className="text-xs font-semibold leading-none">
                    {isUnlocked ? (
                        <span className="text-emerald-600 font-bold">
                            🎉 Congratulations! You've unlocked FREE Standard Shipping!
                        </span>
                    ) : (
                        <span>
                            Add <strong className="text-primary font-bold">{formatCurrency(freeShippingRemaining)}</strong> more for <strong>FREE Shipping</strong>
                        </span>
                    )}
                </span>
            </div>

            {/* Progress Track */}
            <div className="w-full bg-border/60 h-2 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 rounded-full ${
                        isUnlocked ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${isUnlocked ? 100 : freeShippingProgress}%` }}
                />
            </div>
        </div>
    );
}
