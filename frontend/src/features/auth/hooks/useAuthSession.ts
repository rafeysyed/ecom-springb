import { useAuthStore } from '@/store/authStore';

/** Thin convenience wrapper so components don't import useAuthStore directly everywhere. */
export function useAuthSession() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const userId = useAuthStore((s) => s.userId);
    const logout = useAuthStore((s) => s.logout);

    return { isAuthenticated, userId, logout };
}