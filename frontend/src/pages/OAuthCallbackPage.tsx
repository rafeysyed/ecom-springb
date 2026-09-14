import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { oauthLogin } from '@/api/endpoints/oauth';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, AlertCircle } from 'lucide-react';

export function OAuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setSession = useAuthStore((s) => s.login);
    const { showToast } = useToast();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // Provider: "GOOGLE" or "GITHUB"
        const error = searchParams.get('error');

        if (error) {
            setErrorMessage(`OAuth authorization failed: ${error}`);
            return;
        }

        if (!code) {
            setErrorMessage('No authorization code provided in callback.');
            return;
        }

        const provider = (state === 'GITHUB' ? 'GITHUB' : 'GOOGLE') as 'GOOGLE' | 'GITHUB';

        async function completeLogin() {
            try {
                const response = await oauthLogin({
                    provider,
                    code: code as string,
                    redirectUri: `${window.location.origin}/oauth/callback`,
                });

                setSession(response.token, response.name, response.email);
                showToast(`Signed in successfully with ${provider}!`, 'success');
                navigate('/', { replace: true });
            } catch (err: any) {
                const msg = err.response?.data?.message || err.message || 'Failed to exchange OAuth token.';
                setErrorMessage(msg);
            }
        }

        completeLogin();
    }, [searchParams, setSession, navigate, showToast]);

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 bg-background">
            <Card padding="lg" className="w-full max-w-sm mx-auto text-center flex flex-col items-center gap-4">
                {errorMessage ? (
                    <>
                        <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
                            <AlertCircle size={24} />
                        </div>
                        <h2 className="text-lg font-semibold text-text">Sign In Failed</h2>
                        <p className="text-sm text-text-muted">{errorMessage}</p>
                        <Button variant="secondary" className="w-full mt-2" onClick={() => navigate('/login')}>
                            Back to Sign In
                        </Button>
                    </>
                ) : (
                    <>
                        <Loader2 size={36} className="animate-spin text-primary mt-2" />
                        <h2 className="text-lg font-semibold text-text">Completing sign in…</h2>
                        <p className="text-sm text-text-muted">
                            Connecting with your account and verifying credentials.
                        </p>
                    </>
                )}
            </Card>
        </div>
    );
}
