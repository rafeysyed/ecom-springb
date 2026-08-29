import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest } from '@/api/types/user.types';

export function useLogin() {
    const setSession = useAuthStore((s) => s.login);

    return useMutation({
        mutationFn: (payload: LoginRequest) => login(payload),
        onSuccess: (data) => {
            setSession(data.token);
        },
    });
}