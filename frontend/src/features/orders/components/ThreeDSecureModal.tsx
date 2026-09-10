import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/utils/formatCurrency';

interface ThreeDSecureModalProps {
    isOpen: boolean;
    orderId: string;
    amount: number;
    isPending: boolean;
    error?: string | null;
    onConfirm: (otp: string) => void;
    onCancel: () => void;
}

export function ThreeDSecureModal({
    isOpen,
    orderId,
    amount,
    isPending,
    error,
    onConfirm,
    onCancel,
}: ThreeDSecureModalProps) {
    const [otp, setOtp] = useState('123456');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(otp);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Bank Header */}
                <div className="bg-primary px-6 py-4 text-primary-foreground flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={24} className="text-white" />
                        <div>
                            <h3 className="font-semibold text-base leading-tight">Bank 3D Secure</h3>
                            <p className="text-xs text-primary-foreground/80">Identity & Payment Verification</p>
                        </div>
                    </div>
                    <Lock size={18} className="text-white/80" />
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div className="bg-surface-muted p-3.5 rounded-lg border border-border flex justify-between items-center text-sm">
                        <div>
                            <span className="text-text-muted text-xs block">Order</span>
                            <span className="font-mono font-medium text-text text-xs">#{orderId.slice(0, 8)}...</span>
                        </div>
                        <div className="text-right">
                            <span className="text-text-muted text-xs block">Amount</span>
                            <span className="font-bold text-text text-base">{formatCurrency(amount)}</span>
                        </div>
                    </div>

                    <div className="text-sm text-text-muted">
                        A One-Time Password (OTP) has been generated to authorize this transaction.
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-primary flex items-start gap-2">
                        <span className="font-bold">Test Sandbox:</span>
                        <span>
                            Enter <code className="bg-primary/10 px-1 py-0.5 rounded font-mono font-bold">123456</code> to approve, or any other code to test authentication failure.
                        </span>
                    </div>

                    <Input
                        label="One-Time Passcode (OTP)"
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="text-center tracking-widest font-mono text-lg font-bold"
                    />

                    {error && (
                        <div className="p-3 bg-danger-light border border-danger/20 rounded-lg flex items-center gap-2 text-danger text-xs">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            disabled={isPending}
                            onClick={onCancel}
                        >
                            Cancel Payment
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            isLoading={isPending}
                        >
                            Authorize Payment
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
