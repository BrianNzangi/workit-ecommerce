import { GraphQLError } from "graphql";
import { unauthorizedError } from "@/lib/graphql/errors";
import { auth } from "@/lib/auth/auth-server";
import { AdminRole, Permission, hasAnyPermission, hasRoleAccess } from "@/lib/auth/rbac";

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
    allowedRoles: AdminRole[],
): void {
    requireAuth(context);

    if (!context.user || !hasRoleAccess(context.user.role, allowedRoles)) {
        throw new GraphQLError("Insufficient permissions", {
            extensions: {
                code: "FORBIDDEN",
            },
        });
    }
}

export function requirePermission(
    context: AuthContext,
    requiredPermissions: Permission | Permission[],
): void {
    requireAuth(context);

    const permissionList = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

    if (!context.user || !hasAnyPermission(context.user.role, permissionList)) {
        throw new GraphQLError("Insufficient permissions", {
            extensions: {
                code: "FORBIDDEN",
            },
        });
    }
}
