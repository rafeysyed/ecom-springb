import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CancelOrderModalProps {
    isOpen: boolean;
    orderId: string;
    isPending: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function CancelOrderModal({
    isOpen,
    orderId,
    isPending,
    onClose,
    onConfirm,
}: CancelOrderModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div
                className="bg-surface rounded-xl border border-border max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-150"
                role="dialog"
                aria-modal="true"
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors p-1 rounded-lg"
                    aria-label="Close modal"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text">Cancel Order?</h3>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            Are you sure you want to cancel order <span className="font-mono font-medium text-text">#{orderId.slice(0, 8)}...</span>?
                        </p>
                        <p className="text-xs text-text-muted mt-2 leading-relaxed">
                            Any reserved items will be returned to inventory and a refund will be issued to your original payment method.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Keep Order
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="gap-1.5"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Cancelling…
                            </>
                        ) : (
                            'Yes, Cancel Order'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
