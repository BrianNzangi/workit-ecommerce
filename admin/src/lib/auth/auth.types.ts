import type { Session, User } from "./auth-server";

/**
 * Re-export inferred types
 */
export type { Session, User };

/**
 * Auth state for client components
 */
export interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

/**
 * Auth error types
 */
export type AuthError =
    | "invalid_credentials"
    | "user_not_found"
    | "email_already_exists"
    | "session_expired"
    | "unauthorized"
    | "unknown_error";

/**
 * Auth response
 */
export interface AuthResponse<T = any> {
    success: boolean;
    data?: T;
    error?: AuthError;
    message?: string;
}
