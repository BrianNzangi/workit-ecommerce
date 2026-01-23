import { createAuthContext, AuthContext } from '@/lib/middleware/auth.middleware';

export interface GraphQLContext {
  auth: AuthContext;
}

export async function createContext(req?: Request): Promise<GraphQLContext> {
  // Extract authorization header from request
  const authHeader = req?.headers.get('authorization') || undefined;

  // Create auth context
  const auth = await createAuthContext(authHeader);

  return {
    auth,
  };
}
