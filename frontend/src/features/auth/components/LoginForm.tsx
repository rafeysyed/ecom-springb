import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface LocationState {
    from?: { pathname: string };
}

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { mutate: doLogin, isPending, error } = useLogin();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const state = location.state as LocationState | null;
        const redirectTo = state?.from?.pathname ?? '/';

        doLogin(
            { email, password },
            { onSuccess: () => navigate(redirectTo, { replace: true }) }
        );
    };

    return (
        <Card padding="lg" className="w-full max-w-sm mx-auto">
            <h1 className="text-xl font-semibold text-text mb-1">Welcome back</h1>
            <p className="text-sm text-text-muted mb-6">Sign in to continue shopping.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label="Password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && (
                    <p className="text-sm text-danger">
                        Invalid email or password. Please try again.
                    </p>
                )}

                <Button type="submit" isLoading={isPending} className="mt-2">
                    Sign in
                </Button>
            </form>

            <p className="text-sm text-text-muted mt-6 text-center">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
                    Create one
                </Link>
            </p>
        </Card>
    );
}