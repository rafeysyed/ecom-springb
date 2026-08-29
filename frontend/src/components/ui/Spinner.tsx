type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-[3px]',
};

interface SpinnerProps {
    size?: SpinnerSize;
    className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label="Loading"
            className={`
        inline-block rounded-full border-current border-t-transparent
        animate-spin opacity-80
        ${SIZE_CLASSES[size]}
        ${className}
      `}
        />
    );
}