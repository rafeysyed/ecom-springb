import { Spinner } from '@/components/ui/Spinner';

interface LoadingStateProps {
    label?: string;
}

export function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-muted">
            <Spinner size="lg" />
            <span className="text-sm">{label}</span>
        </div>
    );
}