import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const navigate = useNavigate();
    const { showToast } = useToast();
    const { mutate: doRegister, isPending, error } = useRegister();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setConfirmError('');

        if (password !== confirmPassword) {
            setConfirmError('Passwords do not match.');
            return;
        }

        doRegister(
            { username, email, password },
            {
                onSuccess: () => {
                    showToast('Account created — please sign in.', 'success');
                    navigate('/login');
                },
            }
        );
    };

    return (
        <Card padding="lg" className="w-full max-w-sm mx-auto">
            <h1 className="text-xl font-semibold text-text mb-1">Create your account</h1>
            <p className="text-sm text-text-muted mb-6">It only takes a minute.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
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
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Input
                    label="Confirm password"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmError}
                    required
                />

                {error && (
                    <p className="text-sm text-danger">
                        Something went wrong creating your account. Please try again.
                    </p>
                )}

                <Button type="submit" isLoading={isPending} className="mt-2">
                    Create account
                </Button>
            </form>

            <p className="text-sm text-text-muted mt-6 text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                    Sign in
                </Link>
            </p>
        </Card>
    );
}