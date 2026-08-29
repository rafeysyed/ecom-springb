import { RegisterForm } from '@/features/auth/components/RegisterForm';

export function RegisterPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 bg-background">
            <RegisterForm />
        </div>
    );
}