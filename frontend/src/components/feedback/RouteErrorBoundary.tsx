import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export function RouteErrorBoundary() {
    const error = useRouteError();

    let errorMessage = 'An unexpected error occurred.';
    let errorStatus = 'Error';

    if (isRouteErrorResponse(error)) {
        errorStatus = `${error.status}`;
        errorMessage = error.statusText || error.data?.message || errorMessage;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return (
        <PageContainer className="text-center py-20">
            <div className="w-14 h-14 rounded-full bg-danger-light text-danger flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} />
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">{errorStatus}</h1>
            <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
                {errorMessage}
            </p>
            <div className="flex justify-center gap-3">
                <Button onClick={() => window.location.reload()} variant="secondary">
                    Try again
                </Button>
                <Link to="/">
                    <Button>Back to Home</Button>
                </Link>
            </div>
        </PageContainer>
    );
}
