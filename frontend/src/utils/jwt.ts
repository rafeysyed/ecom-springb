import { jwtDecode } from 'jwt-decode';
import type { DecodedToken } from '@/api/types/user.types';

/** Decodes a JWT and returns its payload, or null if malformed. */
export function decodeToken(token: string): DecodedToken | null {
    try {
        return jwtDecode<DecodedToken>(token);
    } catch {
        return null;
    }
}

/** True if the token's exp claim is in the past. */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    return decoded.exp * 1000 < Date.now();
}