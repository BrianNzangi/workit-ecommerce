import { BaseService } from '../base/base.service';
import { validationError, unauthorizedError } from '@/lib/graphql/errors';
import { RegisterAdminInput, LoginInput, AuthPayload } from './auth.types';

export class AuthService extends BaseService {
    /**
     * Register a new admin user
     */
    async register(input: RegisterAdminInput): Promise<AuthPayload> {
        try {
            const response = await this.adminClient.auth.register(input);

            // Note: The register endpoint returns { success, user }
            const { user } = response;

            return {
                token: "",
                access_token: "",
                user: user as any,
                expiresAt: this.getTokenExpiration(),
            };
        } catch (error: any) {
            throw validationError(error.message || 'Registration failed');
        }
    }

    /**
     * Login an admin user
     */
    async login(input: LoginInput): Promise<AuthPayload> {
        try {
            console.log('[AUTH] Login attempt for:', input.email);
            const response = await this.adminClient.auth.login(input);
            const { token, user } = response;

            console.log('[AUTH] Login successful for:', input.email);

            return {
                token: token || "",
                access_token: token || "", // Backward compat
                user: user as any,
                expiresAt: this.getTokenExpiration(),
            };
        } catch (error: any) {
            console.log('[AUTH] Login failed for:', input.email, error.message);
            throw unauthorizedError('Invalid credentials');
        }
    }

    /**
     * Get user from token
     */
    async getUserFromToken(token: string): Promise<any | null> {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
            const response = await fetch(`${baseUrl}/auth/get-session`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) return null;
            const data = await response.json();
            return data; // Expected { session, user }
        } catch (error) {
            return null;
        }
    }

    /**
     * Get token expiration date
     */
    private getTokenExpiration(): Date {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        return expiresAt;
    }
}
