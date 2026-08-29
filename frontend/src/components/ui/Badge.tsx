import { type ReactNode } from 'react';

type BadgeTone = 'neutral' | 'primary' | 'success' | 'danger' | 'pending' | 'confirmed' | 'shipped' | 'cancelled';

interface BadgeProps {
    children: ReactNode;
    tone?: BadgeTone;
    className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
    neutral: 'bg-surface-muted text-text-muted',
    primary: 'bg-primary-light text-primary-hover',
    success: 'bg-success-light text-success',
    danger: 'bg-danger-light text-danger',
    pending: 'bg-[--color-status-pending-bg] text-[--color-status-pending-text]',
    confirmed: 'bg-[--color-status-confirmed-bg] text-[--color-status-confirmed-text]',
    shipped: 'bg-[--color-status-shipped-bg] text-[--color-status-shipped-text]',
    cancelled: 'bg-[--color-status-cancelled-bg] text-[--color-status-cancelled-text]',
};

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium
        ${TONE_CLASSES[tone]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}