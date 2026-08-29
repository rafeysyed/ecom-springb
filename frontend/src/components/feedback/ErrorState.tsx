import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
    title?: string;
    description?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = 'Something went wrong',
    description = 'Please try again in a moment.',
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-14 h-14 rounded-full bg-danger-light flex items-center justify-center mb-4 text-danger">
                <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-medium text-text mb-1">{title}</h3>
            <p className="text-sm text-text-muted max-w-sm">{description}</p>
            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry} className="mt-5">
                    Try again
                </Button>
            )}
        </div>
    );
}