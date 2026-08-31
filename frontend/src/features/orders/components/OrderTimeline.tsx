import { Check, AlertCircle } from 'lucide-react';
import type { OrderStatus } from '@/api/types/order.types';

interface OrderTimelineProps {
    status?: OrderStatus;
}

const STEPS = [
    { status: 'CREATED', label: 'Order Placed' },
    { status: 'PAID', label: 'Payment Confirmed' },
    { status: 'SHIPPED', label: 'Shipped' },
    { status: 'DELIVERED', label: 'Delivered' },
];

export function OrderTimeline({ status = 'CREATED' }: OrderTimelineProps) {
    const s = status.toUpperCase();

    if (s === 'FAILED' || s === 'CANCELLED') {
        return (
            <div className="flex items-center gap-3 bg-danger-light text-danger rounded-lg p-4 text-sm font-medium">
                <AlertCircle size={20} className="shrink-0" />
                <div>
                    <p className="font-semibold">{s === 'FAILED' ? 'Payment Failed' : 'Order Cancelled'}</p>
                    <p className="text-xs opacity-90 mt-0.5">
                        {s === 'FAILED'
                            ? 'The transaction could not be processed. Please check your payment method.'
                            : 'This order was cancelled.'}
                    </p>
                </div>
            </div>
        );
    }

    let currentIndex = 0;
    if (s === 'PAID' || s === 'CONFIRMED' || s === 'PAYMENT_COMPLETED') {
        currentIndex = 1;
    } else if (s === 'SHIPPED') {
        currentIndex = 2;
    } else if (s === 'DELIVERED') {
        currentIndex = 3;
    }

    return (
        <div className="flex items-center w-full">
            {STEPS.map((step, i) => {
                const isComplete = i <= currentIndex;
                const isCurrent = i === currentIndex;
                const isLast = i === STEPS.length - 1;

                return (
                    <div key={step.status} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  transition-colors duration-300 font-semibold text-xs
                  ${isComplete ? 'bg-primary text-white shadow-soft' : 'bg-surface-muted text-text-subtle border border-border'}
                  ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                `}
                            >
                                {isComplete ? <Check size={16} /> : <span>{i + 1}</span>}
                            </div>
                            <span className={`text-xs font-medium text-center whitespace-nowrap ${isComplete ? 'text-text' : 'text-text-subtle'}`}>
                                {step.label}
                            </span>
                        </div>

                        {!isLast && (
                            <div
                                className={`
                  h-0.5 flex-1 mx-2 mb-6 transition-colors duration-300
                  ${i < currentIndex ? 'bg-primary' : 'bg-surface-muted'}
                `}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}