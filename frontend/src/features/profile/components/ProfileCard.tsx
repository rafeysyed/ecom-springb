import { Mail, Calendar } from 'lucide-react';
import type { UserProfile } from '@/api/types/user.types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/utils/formatDate';

interface ProfileCardProps {
    profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
    const formattedJoinDate = profile.createdAt ? formatDate(profile.createdAt) : null;

    return (
        <Card padding="lg" className="flex flex-col items-center text-center gap-4">
            <Avatar name={profile.name || profile.email || 'User'} size="lg" />

            <div>
                <h2 className="text-lg font-semibold text-text">{profile.name || 'Member'}</h2>
                {formattedJoinDate && formattedJoinDate !== 'N/A' && (
                    <p className="text-sm text-text-muted">Member since {formattedJoinDate}</p>
                )}
            </div>

            <div className="w-full border-t border-border pt-4 flex flex-col gap-3 text-left">
                {profile.email && (
                    <div className="flex items-center gap-3 text-sm text-text">
                        <Mail size={16} className="text-text-muted shrink-0" />
                        <span className="truncate">{profile.email}</span>
                    </div>
                )}
                {formattedJoinDate && formattedJoinDate !== 'N/A' && (
                    <div className="flex items-center gap-3 text-sm text-text">
                        <Calendar size={16} className="text-text-muted shrink-0" />
                        <span>Joined {formattedJoinDate}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}