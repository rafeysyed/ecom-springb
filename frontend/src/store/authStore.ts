import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { decodeToken, isTokenExpired } from '@/utils/jwt';

interface AuthState {
    token: string | null;
    userId: string | null;
    roles: string[];
    isAuthenticated: boolean;
    isHydrated: boolean;

    /** Call after a successful POST /internal/auth/login response. */
    login: (token: string) => void;
    logout: () => void;
    setHydrated: () => void;
}

// Synchronously read initial storage if available in browser
function getInitialStoredAuth() {
    if (typeof window === 'undefined') {
        return { token: null, userId: null, roles: [], isAuthenticated: false };
    }
    try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) {
            const parsed = JSON.parse(raw);
            const token = parsed?.state?.token;
            if (token && !isTokenExpired(token)) {
                const decoded = decodeToken(token);
                return {
                    token,
                    userId: decoded?.sub ?? parsed?.state?.userId ?? null,
                    roles: decoded?.roles ?? parsed?.state?.roles ?? [],
                    isAuthenticated: true,
                };
            }
        }
    } catch {
        // Fallback on parse error
    }
    return { token: null, userId: null, roles: [], isAuthenticated: false };
}

const initialAuth = getInitialStoredAuth();

export function getStoredToken(): string | null {
    const memoryToken = useAuthStore.getState().token;
    if (memoryToken) return memoryToken;

    if (typeof window !== 'undefined') {
        try {
            const raw = localStorage.getItem('auth-storage');
            if (raw) {
                const parsed = JSON.parse(raw);
                const token = parsed?.state?.token;
                if (token && !isTokenExpired(token)) {
                    return token;
                }
            }
        } catch {
            // Ignore
        }
    }
    return null;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: initialAuth.token,
            userId: initialAuth.userId,
            roles: initialAuth.roles,
            isAuthenticated: initialAuth.isAuthenticated,
            isHydrated: true,

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

            setHydrated: () => {
                set({ isHydrated: true });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
                if (state?.token && isTokenExpired(state.token)) {
                    state.logout();
                }
            },
        }
    )
);