import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string; // omit for the current (last) item
    onClick?: () => void;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <span key={i} className="flex items-center gap-1.5">
                        {item.href && !isLast ? (
                            <Link
                                to={item.href}
                                onClick={item.onClick}
                                className="text-text-muted hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-text font-medium">{item.label}</span>
                        )}
                        {!isLast && <ChevronRight size={14} className="text-text-subtle" />}
                    </span>
                );
            })}
        </nav>
    );
}