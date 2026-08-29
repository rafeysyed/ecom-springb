import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ProfileCard } from '@/features/profile/components/ProfileCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useAuthStore } from '@/store/authStore';
import { Package } from 'lucide-react';

export function ProfilePage() {
    const { data: profile, isLoading } = useProfile();
    const logout = useAuthStore((s) => s.logout);

    return (
        <PageContainer className="max-w-md">
            {isLoading ? (
                <LoadingState label="Loading profile…" />
            ) : profile ? (
                <>
                    <ProfileCard profile={profile} />
                    <div className="mt-4 flex flex-col gap-2">
                        <Link to="/orders">
                            <Button variant="secondary" className="w-full">
                                <Package size={16} />
                                View Orders
                            </Button>
                        </Link>
                        <Button variant="ghost" className="w-full" onClick={logout}>
                            Sign out
                        </Button>
                    </div>
                </>
            ) : (
                /* Profile API unavailable — show minimal fallback so page doesn't crash */
                <Card padding="lg" className="flex flex-col items-center text-center gap-4">
                    <Avatar name="Account" size="lg" />
                    <div>
                        <h2 className="text-lg font-semibold text-text">Your Account</h2>
                        <p className="text-sm text-text-muted mt-1">Profile details couldn't be loaded.</p>
                    </div>
                    <div className="w-full flex flex-col gap-2 border-t border-border pt-4">
                        <Link to="/orders">
                            <Button variant="secondary" className="w-full">
                                <Package size={16} />
                                View Orders
                            </Button>
                        </Link>
                        <Button variant="ghost" className="w-full" onClick={logout}>
                            Sign out
                        </Button>
                    </div>
                </Card>
            )}
        </PageContainer>
    );
}