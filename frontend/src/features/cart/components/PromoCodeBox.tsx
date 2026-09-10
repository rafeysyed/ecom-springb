import { useState } from 'react';
import { Tag, X, Check, Sparkles } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { Button } from '@/components/ui/Button';

interface PromoCodeBoxProps {
    className?: string;
}

export function PromoCodeBox({ className = '' }: PromoCodeBoxProps) {
    const { appliedPromo, applyPromoCode, removePromoCode } = useCart();
    const [code, setCode] = useState('');
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const handleApply = (codeToApply: string) => {
        if (!codeToApply.trim()) return;
        const res = applyPromoCode(codeToApply);
        setMessage({ text: res.message, isError: !res.success });
        if (res.success) {
            setCode('');
        }
    };

    return (
        <div className={`flex flex-col gap-2.5 ${className}`}>
            <label className="text-xs font-semibold text-text flex items-center gap-1.5 uppercase tracking-wide">
                <Tag size={13} className="text-primary" />
                Promo Code
            </label>

            {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-xs">
                    <div className="flex items-center gap-2">
                        <Check size={14} className="shrink-0 font-bold" />
                        <div>
                            <span className="font-bold tracking-wide uppercase">{appliedPromo.code}</span>
                            <span className="text-[11px] text-text-muted block">{appliedPromo.description}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={removePromoCode}
                        className="p-1 hover:bg-emerald-500/20 rounded text-emerald-700 transition-colors"
                        title="Remove promo code"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value.toUpperCase());
                                setMessage(null);
                            }}
                            placeholder="Enter coupon code"
                            className="flex-1 px-3 py-2 text-xs uppercase tracking-wider rounded-lg border border-border bg-surface text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary font-mono"
                        />
                        <Button
                            size="sm"
                            type="button"
                            disabled={!code.trim()}
                            onClick={() => handleApply(code)}
                        >
                            Apply
                        </Button>
                    </div>

                    {message && (
                        <span className={`text-[11px] ${message.isError ? 'text-danger' : 'text-emerald-500'}`}>
                            {message.text}
                        </span>
                    )}

                    {/* Quick suggestion badges */}
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <Sparkles size={11} className="text-primary" />
                            Popular:
                        </span>
                        {['SAVE10', 'WELCOME20', 'FREESHIP'].map((sample) => (
                            <button
                                key={sample}
                                type="button"
                                onClick={() => handleApply(sample)}
                                className="px-2 py-0.5 text-[10px] font-mono font-medium rounded border border-border bg-surface-muted hover:border-primary hover:text-primary transition-all text-text-muted"
                            >
                                {sample}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
