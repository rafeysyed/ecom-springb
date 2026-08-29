import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/api/endpoints/users';
import { useAuthStore } from '@/store/authStore';

export function useProfile() {
    const userId = useAuthStore((s) => s.userId);

    return useQuery({
        queryKey: ['users', userId],
        queryFn: () => getUserProfile(userId as string),
        enabled: !!userId,
    });
}