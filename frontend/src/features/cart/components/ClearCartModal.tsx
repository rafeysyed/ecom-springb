import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ClearCartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ClearCartModal({ isOpen, onClose, onConfirm }: ClearCartModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 animate-in zoom-in-95 duration-150 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-amber-500">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base text-text">Clear Your Cart?</h3>
                        <p className="text-xs text-text-muted">This will remove all items currently in your shopping cart.</p>
                    </div>
                </div>

                <p className="text-xs text-text-muted">
                    Are you sure you want to proceed? This action cannot be undone.
                </p>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={onClose}
                    >
                        Keep Items
                    </Button>
                    <Button
                        type="button"
                        className="flex-1 bg-danger hover:bg-danger/90 text-white"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Clear Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}
