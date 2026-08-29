import { Check } from 'lucide-react';
import type { OrderStatus } from '@/api/types/order.types';

interface OrderTimelineProps {
    status: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string }[] = [
    { status: 'PENDING', label: 'Order Placed' },
    { status: 'CONFIRMED', label: 'Confirmed' },
    { status: 'SHIPPED', label: 'Shipped' },
    { status: 'DELIVERED', label: 'Delivered' },
];

export function OrderTimeline({ status }: OrderTimelineProps) {
    if (status === 'CANCELLED') {
        return (
            <div className="bg-danger-light text-danger rounded-md px-4 py-3 text-sm font-medium">
                This order was cancelled.
            </div>
        );
    }

    const currentIndex = STEPS.findIndex((s) => s.status === status);

    return (
        <div className="flex items-center">
            {STEPS.map((step, i) => {
                const isComplete = i <= currentIndex;
                const isLast = i === STEPS.length - 1;

                return (
                    <div key={step.status} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  transition-colors duration-300
                  ${isComplete ? 'bg-primary text-white' : 'bg-surface-muted text-text-subtle'}
                `}
                            >
                                {isComplete ? <Check size={16} /> : <span className="text-xs">{i + 1}</span>}
                            </div>
                            <span className={`text-xs font-medium text-center ${isComplete ? 'text-text' : 'text-text-subtle'}`}>
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