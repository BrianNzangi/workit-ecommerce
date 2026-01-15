import { PrismaClient, AdminUser } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import {
  validationError,
  unauthorizedError,
  duplicateError,
} from '@/lib/graphql/errors';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '7d'; // 7 days

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
  user: Omit<AdminUser, 'passwordHash'>;
  expiresAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthService {
  constructor(private prisma: PrismaClient) { }

  /**
   * Register a new admin user
   */
  async register(input: RegisterAdminInput): Promise<AuthPayload> {
    // Validate input
    if (!input.email || !input.password || !input.firstName || !input.lastName) {
      throw validationError('All fields are required', 'email');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw validationError('Invalid email format', 'email');
    }

    // Validate password strength (minimum 8 characters)
    if (input.password.length < 8) {
      throw validationError('Password must be at least 8 characters', 'password');
    }

    // Check if user already exists
    const existingUser = await this.prisma.adminUser.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw duplicateError('User with this email already exists', 'email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create user
    const user = await this.prisma.adminUser.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role || 'ADMIN',
      },
    });

    // Generate token
    const token = this.generateToken(user);
    const expiresAt = this.getTokenExpiration();

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
      expiresAt,
    };
  }

  /**
   * Login an admin user
   */
  async login(input: LoginInput): Promise<AuthPayload> {
    // Validate input
    if (!input.email || !input.password) {
      throw validationError('Email and password are required');
    }

    console.log('[AUTH] Login attempt for:', input.email);

    // Find user
    const user = await this.prisma.adminUser.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      console.log('[AUTH] User not found:', input.email);
      throw unauthorizedError('Invalid credentials');
    }

    console.log('[AUTH] User found:', user.email, 'Enabled:', user.enabled);

    // Check if user is enabled
    if (!user.enabled) {
      console.log('[AUTH] Account disabled for:', input.email);
      throw unauthorizedError('Account is disabled');
    }

    // Verify password
    console.log('[AUTH] Verifying password...');
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    console.log('[AUTH] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('[AUTH] Invalid password for:', input.email);
      throw unauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);
    const expiresAt = this.getTokenExpiration();

    console.log('[AUTH] Login successful for:', input.email);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
      expiresAt,
    };
  }

  /**
   * Verify a JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const payload = verify(token, JWT_SECRET) as TokenPayload;
      return payload;
    } catch (error) {
      throw unauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Get user from token
   */
  async getUserFromToken(token: string): Promise<Omit<AdminUser, 'passwordHash'> | null> {
    try {
      const payload = this.verifyToken(token);

      const user = await this.prisma.adminUser.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.enabled) {
        return null;
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: AdminUser): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
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
