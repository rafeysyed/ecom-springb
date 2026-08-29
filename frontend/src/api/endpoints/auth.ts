import { apiClient } from '@/api/client';
import type { RegisterRequest, LoginRequest, LoginResponse } from '@/api/types/user.types';

export async function register(payload: RegisterRequest): Promise<void> {
    await apiClient.post('/internal/users/register', payload);
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/internal/auth/login', payload);
    return data;
}