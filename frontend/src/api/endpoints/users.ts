import { apiClient } from '@/api/client';
import type { UserProfile } from '@/api/types/user.types';

export async function getUserProfile(id: string): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>(`/internal/users/${id}`);
    return data;
}