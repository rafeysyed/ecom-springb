import { User } from 'lucide-react';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
    name?: string | null;
    size?: AvatarSize;
    className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
};

const ICON_SIZES: Record<AvatarSize, number> = {
    sm: 14,
    md: 18,
    lg: 26,
};

function getInitials(name?: string | null): string {
    if (!name || typeof name !== 'string') return '';
    const trimmed = name.trim();
    if (!trimmed) return '';

    // If it's an email address (e.g. "rahichauhan37@gmail.com")
    if (trimmed.includes('@') && !trimmed.includes(' ')) {
        const username = trimmed.split('@')[0];
        const emailParts = username.split(/[._-]/).filter(Boolean);
        if (emailParts.length >= 2) {
            return (emailParts[0][0] + emailParts[1][0]).toUpperCase();
        }
        return username[0] ? username[0].toUpperCase() : '';
    }

    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) {
        // Single word (e.g. "Rahi" -> "R", "Admin" -> "A")
        return parts[0][0].toUpperCase();
    }
    // Multiple words (e.g. "Rahi Chauhan" -> "RC", "John Doe" -> "JD")
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
    const initials = getInitials(name);

    return (
        <div
            className={`
        inline-flex items-center justify-center rounded-full
        bg-primary-light text-primary-hover font-semibold select-none
        ${SIZE_CLASSES[size]}
        ${className}
      `}
            title={name || 'User profile'}
        >
            {initials ? initials : <User size={ICON_SIZES[size]} className="text-primary-hover" />}
        </div>
    );
}