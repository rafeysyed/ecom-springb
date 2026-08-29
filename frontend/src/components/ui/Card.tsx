import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    /** Adds hover elevation — use for clickable cards like ProductCard. */
    interactive?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
};

export function Card({
    children,
    interactive = false,
    padding = 'md',
    className = '',
    ...rest
}: CardProps) {
    return (
        <div
            className={`
        bg-surface rounded-lg shadow-soft
        ${PADDING_CLASSES[padding]}
        ${interactive ? 'transition-shadow duration-200 hover:shadow-soft-hover cursor-pointer' : ''}
        ${className}
      `}
            {...rest}
        >
            {children}
        </div>
    );
}