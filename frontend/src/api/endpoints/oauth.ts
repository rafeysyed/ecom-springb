import { apiClient } from '@/api/client';

export interface OAuthLoginRequest {
    provider: 'GOOGLE' | 'GITHUB';
    code?: string;
    redirectUri?: string;
    isDemo?: boolean;
    demoEmail?: string;
    demoName?: string;
}

export interface OAuthLoginResponse {
    token: string;
    userId: string;
    email: string;
    name: string;
    roles: string[];
    provider: string;
}

export async function oauthLogin(payload: OAuthLoginRequest): Promise<OAuthLoginResponse> {
    const { data } = await apiClient.post<OAuthLoginResponse>('/internal/auth/oauth/login', payload);
    return data;
}
