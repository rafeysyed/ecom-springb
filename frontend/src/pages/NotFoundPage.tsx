import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
    return (
        <PageContainer className="text-center py-24">
            <h1 className="text-5xl font-semibold text-text mb-3">404</h1>
            <p className="text-text-muted mb-8">This page doesn't exist.</p>
            <Link to="/">
                <Button>Back to home</Button>
            </Link>
        </PageContainer>
    );
}