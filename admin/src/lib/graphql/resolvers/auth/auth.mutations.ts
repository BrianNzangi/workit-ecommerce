import { AuthService, RegisterAdminInput, LoginInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const authMutations = {
    register: async (
        _parent: any,
        { input }: { input: RegisterAdminInput },
        _context: GraphQLContext
    ) => {
        const authService = new AuthService();
        return await authService.register(input);
    },

    login: async (
        _parent: any,
        { input }: { input: LoginInput },
        _context: GraphQLContext
    ) => {
        const authService = new AuthService();
        return await authService.login(input);
    },

    logout: async (_parent: any, _args: any, context: GraphQLContext) => {
        requireAuth(context.auth);
        return true;
    },
};
