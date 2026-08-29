import { type ReactNode } from 'react';

interface SidebarProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

export function Sidebar({ title, children, className = '' }: SidebarProps) {
    return (
        <aside className={`w-full md:w-64 shrink-0 ${className}`}>
            {title && (
                <h2 className="text-sm font-semibold text-text mb-4 uppercase tracking-wide">
                    {title}
                </h2>
            )}
            <div className="flex flex-col gap-6">{children}</div>
        </aside>
    );
}