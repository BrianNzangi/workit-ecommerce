import { apiClient } from '@/lib/api-client';
import {
  validationError,
  unauthorizedError,
} from '@/lib/graphql/errors';

export interface RegisterAdminInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  access_token: string;
  user: any;
  expiresAt: Date;
}

export class AuthService {
  constructor() { }

  /**
   * Register a new admin user via NestJS API
   */
  async register(input: RegisterAdminInput): Promise<AuthPayload> {
    try {
      const response = await apiClient.post<any>('/auth/register', input);
      const { access_token, user } = response;

      return {
        token: access_token,
        access_token,
        user,
        expiresAt: this.getTokenExpiration(),
      };
    } catch (error: any) {
      throw validationError(error.message || 'Registration failed');
    }
  }

  /**
   * Login an admin user via NestJS API
   */
  async login(input: LoginInput): Promise<AuthPayload> {
    try {
      console.log('[AUTH] Login attempt for:', input.email);
      const response = await apiClient.post<any>('/auth/login', input);
      const { access_token, user } = response;

      console.log('[AUTH] Login successful for:', input.email);

      return {
        token: access_token,
        access_token,
        user,
        expiresAt: this.getTokenExpiration(),
      };
    } catch (error: any) {
      console.log('[AUTH] Login failed for:', input.email, error.message);
      throw unauthorizedError('Invalid credentials');
    }
  }

  /**
   * Get user from token via NestJS API
   */
  async getUserFromToken(token: string): Promise<any | null> {
    try {
      const response = await apiClient.get<any>('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
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
