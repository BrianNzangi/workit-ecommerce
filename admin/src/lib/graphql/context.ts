import { createAuthContext, AuthContext } from '@/lib/middleware/auth.middleware';

export interface GraphQLContext {
  auth: AuthContext;
}

export async function createContext(req?: Request): Promise<GraphQLContext> {
  const auth = await createAuthContext(req);

  return {
    auth,
  };
}
