import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { SocialLoginButtons } from './SocialLoginButtons';

export function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);
    const [registeredSuccess, setRegisteredSuccess] = useState(false);

    const navigate = useNavigate();
    const { showToast } = useToast();
    const { mutate: doRegister, isPending } = useRegister();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setConfirmError('');
        setApiError(null);

        if (password !== confirmPassword) {
            setConfirmError('Passwords do not match.');
            return;
        }

        doRegister(
            { username, email, password },
            {
                onSuccess: () => {
                    setRegisteredSuccess(true);
                    showToast('Account created successfully! Redirecting to sign in...', 'success');
                    setTimeout(() => {
                        navigate('/login');
                    }, 1200);
                },
                onError: (err: any) => {
                    const status = err?.response?.status;
                    let msg = 'Something went wrong creating your account. Please try again.';
                    if (status === 409 || status === 500) {
                        msg = 'This email address is already registered or unavailable. Please sign in or use another email.';
                    } else if (err?.response?.data?.message) {
                        msg = err.response.data.message;
                    }
                    setApiError(msg);
                    showToast(msg, 'error');
                },
            }
        );
    };

    if (registeredSuccess) {
        return (
            <Card padding="lg" className="w-full max-w-sm mx-auto text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-4 text-2xl font-bold">
                    ✓
                </div>
                <h2 className="text-xl font-semibold text-text mb-2">Account Created!</h2>
                <p className="text-sm text-text-muted mb-6">
                    Redirecting to sign in page now...
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                    Go to Sign In
                </Button>
            </Card>
        );
    }

    return (
        <Card padding="lg" className="w-full max-w-sm mx-auto">
            <h1 className="text-xl font-semibold text-text mb-1">Create your account</h1>
            <p className="text-sm text-text-muted mb-6">Sign up with your details to start shopping.</p>

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

                {apiError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-relaxed">
                        {apiError}
                    </div>
                )}

                <Button type="submit" isLoading={isPending} className="mt-2">
                    {isPending ? 'Creating account...' : 'Create account'}
                </Button>
            </form>

            <SocialLoginButtons className="mt-4" />

            <p className="text-sm text-text-muted mt-5 text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
                    Sign in
                </Link>
            </p>
        </Card>
    );
}