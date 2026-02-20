import { GraphQLError } from "graphql";
import { unauthorizedError } from "@/lib/graphql/errors";
import { auth } from "@/lib/auth/auth-server";

export interface AuthContext {
    user: any | null;
    session: any | null;
    isAuthenticated: boolean;
}

export async function createAuthContext(request?: Request): Promise<AuthContext> {
    const sessionResult = await auth.api.getSession({
        headers: request?.headers ?? new Headers(),
    });

    if (!sessionResult) {
        return {
            user: null,
            session: null,
            isAuthenticated: false,
        };
    }

    return {
        user: sessionResult.user,
        session: sessionResult.session,
        isAuthenticated: true,
    };
}

export function requireAuth(context: AuthContext): void {
    if (!context.isAuthenticated || !context.user) {
        throw unauthorizedError("Authentication required");
    }
}

export function requireRole(
    context: AuthContext,
    allowedRoles: ("SUPER_ADMIN" | "ADMIN" | "EDITOR")[],
): void {
    requireAuth(context);

    if (!context.user || !allowedRoles.includes(context.user.role as any)) {
        throw new GraphQLError("Insufficient permissions", {
            extensions: {
                code: "FORBIDDEN",
            },
        });
    }
}
