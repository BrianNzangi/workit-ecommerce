import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const authQueries = {
    me: async (_parent: any, _args: any, context: GraphQLContext) => {
        requireAuth(context.auth);
        return context.auth.user;
    },
};
