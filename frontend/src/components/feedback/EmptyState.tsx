import { type ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center mb-4 text-text-subtle">
                {icon ?? <PackageOpen size={24} />}
            </div>
            <h3 className="text-base font-medium text-text mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-text-muted max-w-sm">{description}</p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}