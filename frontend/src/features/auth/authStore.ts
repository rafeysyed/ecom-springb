import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { decodeToken, isTokenExpired } from '@/utils/jwt';

interface AuthState {
    token: string | null;
    userId: string | null;
    roles: string[];
    isAuthenticated: boolean;

    /** Call after a successful POST /internal/auth/login response. */
    login: (token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            userId: null,
            roles: [],
            isAuthenticated: false,

            login: (token: string) => {
                const decoded = decodeToken(token);
                set({
                    token,
                    userId: decoded?.sub ?? null,
                    roles: decoded?.roles ?? [],
                    isAuthenticated: true,
                });
            },

            logout: () => {
                set({ token: null, userId: null, roles: [], isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage', // localStorage key
            // Re-validate token expiry on rehydration (e.g. after a page refresh
            // days later) so a stale expired token doesn't silently mark the user
            // as authenticated.
            onRehydrateStorage: () => (state) => {
                if (state?.token && isTokenExpired(state.token)) {
                    state.logout();
                }
            },
        }
    )
);