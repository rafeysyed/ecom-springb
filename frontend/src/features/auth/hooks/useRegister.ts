import { useMutation } from '@tanstack/react-query';
import { register } from '@/api/endpoints/auth';
import type { RegisterRequest } from '@/api/types/user.types';

export function useRegister() {
    return useMutation({
        mutationFn: (payload: RegisterRequest) => register(payload),
    });
}