// ---- Requests ----

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// ---- Responses ----

export interface LoginResponse {
    token: string;
}

export interface UserProfile {
    userId: string;
    name: string;
    email: string;
    createdAt: string; // ISO date string
}

// ---- Derived / client-side ----

/** Shape decoded out of the JWT payload (see utils/jwt.ts) */
export interface DecodedToken {
    sub: string; // userId
    roles: string[];
    iat: number;
    exp: number;
}