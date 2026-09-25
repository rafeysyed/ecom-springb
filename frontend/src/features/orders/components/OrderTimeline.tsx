import { Check, AlertCircle, PackageCheck } from 'lucide-react';
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
                            : 'This order was cancelled. Reserved items have been restocked.'}
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

    const isDelivered = s === 'DELIVERED';

    return (
        <div className="flex flex-col gap-4 w-full">
            {isDelivered && (
                <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-lg p-3 text-xs font-medium">
                    <PackageCheck size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Your package has been successfully delivered. Thank you for shopping with us!</span>
                </div>
            )}
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
                      ${isCurrent && isDelivered
                          ? 'bg-emerald-600 text-white shadow-soft ring-2 ring-emerald-500 ring-offset-2'
                          : isComplete
                          ? 'bg-primary text-white shadow-soft'
                          : 'bg-surface-muted text-text-subtle border border-border'}
                      ${isCurrent && !isDelivered ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}
                                >
                                    {isComplete ? <Check size={16} /> : <span>{i + 1}</span>}
                                </div>
                                <span className={`text-xs font-medium text-center whitespace-nowrap ${isCurrent && isDelivered ? 'text-emerald-600 font-semibold' : isComplete ? 'text-text' : 'text-text-subtle'}`}>
                                    {step.label}
                                </span>
                            </div>

                            {!isLast && (
                                <div
                                    className={`
                      h-0.5 flex-1 mx-2 mb-6 transition-colors duration-300
                      ${i < currentIndex ? (isDelivered ? 'bg-emerald-600' : 'bg-primary') : 'bg-surface-muted'}
                    `}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}