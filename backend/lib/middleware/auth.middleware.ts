import { GraphQLError } from 'graphql';
import { AuthService } from '@/lib/services/auth.service';
import { PrismaClient, AdminUser } from '@prisma/client';
import { unauthorizedError } from '@/lib/graphql/errors';

export interface AuthContext {
  user: Omit<AdminUser, 'passwordHash'> | null;
  isAuthenticated: boolean;
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and just "<token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  // If no "Bearer" prefix, assume the entire header is the token
  return authHeader;
}

/**
 * Create authentication context from request headers
 */
export async function createAuthContext(
  authHeader: string | undefined,
  prisma: PrismaClient
): Promise<AuthContext> {
  const token = extractToken(authHeader);

  if (!token) {
    return {
      user: null,
      isAuthenticated: false,
    };
  }

  const authService = new AuthService(prisma);
  const user = await authService.getUserFromToken(token);

  return {
    user,
    isAuthenticated: !!user,
  };
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth(context: AuthContext): void {
  if (!context.isAuthenticated || !context.user) {
    throw unauthorizedError('Authentication required');
  }
}

/**
 * Require specific role - throws error if user doesn't have required role
 */
export function requireRole(
  context: AuthContext,
  allowedRoles: ('SUPER_ADMIN' | 'ADMIN' | 'EDITOR')[]
): void {
  requireAuth(context);

  if (!context.user || !allowedRoles.includes(context.user.role as any)) {
    throw new GraphQLError('Insufficient permissions', {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }
}
