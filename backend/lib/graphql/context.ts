import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { createAuthContext, AuthContext } from '@/lib/middleware/auth.middleware';
import { createDataLoaders, DataLoaders } from './dataloaders';

export interface GraphQLContext {
  prisma: PrismaClient;
  auth: AuthContext;
  loaders: DataLoaders;
}

export async function createContext(req?: Request): Promise<GraphQLContext> {
  // Extract authorization header from request
  const authHeader = req?.headers.get('authorization') || undefined;

  // Create auth context
  const auth = await createAuthContext(authHeader, prisma);

  // Create DataLoaders for this request (they cache within a single request)
  const loaders = createDataLoaders(prisma);

  return {
    prisma,
    auth,
    loaders,
  };
}
