import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary:
        'bg-primary text-white hover:bg-primary-hover shadow-soft hover:shadow-soft-hover',
    secondary:
        'bg-surface text-text border border-border hover:bg-surface-muted shadow-soft',
    ghost: 'bg-transparent text-text hover:bg-surface-muted',
    danger: 'bg-danger text-white hover:opacity-90 shadow-soft',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
    sm: 'text-sm px-3 py-1.5 rounded-sm',
    md: 'text-sm px-5 py-2.5 rounded-md',
    lg: 'text-base px-6 py-3 rounded-md',
};

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    className = '',
    children,
    ...rest
}: ButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-150 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
            {...rest}
        >
            {isLoading && <Spinner size="sm" />}
            {children}
        </button>
    );
}