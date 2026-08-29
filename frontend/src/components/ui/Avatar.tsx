type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
    name: string;
    size?: AvatarSize;
    className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
};

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
    return initials.join('') || '?';
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
    return (
        <div
            className={`
        inline-flex items-center justify-center rounded-full
        bg-primary-light text-primary-hover font-semibold
        ${SIZE_CLASSES[size]}
        ${className}
      `}
            title={name}
        >
            {getInitials(name)}
        </div>
    );
}