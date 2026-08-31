import axios, { type InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore, getStoredToken } from '@/store/authStore';

/**
 * Base gateway URL. In dev this is proxied via vite.config.ts, so requests
 * can hit relative paths (e.g. "/products") and avoid CORS entirely.
 * In production, set VITE_API_BASE_URL to the real gateway origin.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach the bearer token to every request, if present.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
});

// On 401 (expired/invalid token), clear the session so the app can redirect to login.
// The redirect itself is handled by ProtectedRoute reacting to authStore state,
// not here — this layer's only job is to keep the client in sync with the server.
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);