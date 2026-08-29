import { LoginForm } from '@/features/auth/components/LoginForm';

export function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 bg-background">
            <LoginForm />
        </div>
    );
}