import fp from "fastify-plugin";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import {
    adminRoles,
    getPermissionsForRoleAsync,
    hasAnyPermissionAsync,
    hasRoleAccess,
    normalizeAdminRole,
} from "../lib/rbac.js";
import type { Permission } from "../lib/rbac.js";

declare module "fastify" {
    interface FastifyRequest {
        auth: typeof auth;
        session: any | null;
        user: any | null;
        permissions: Permission[];
    }
    interface FastifyInstance {
        authenticate: (request: any, reply: any) => Promise<void>;
        authorize: (roles: string[]) => (request: any, reply: any) => Promise<void>;
        authorizePermission: (permissions: Permission | Permission[]) => (request: any, reply: any) => Promise<void>;
    }
}

export default fp(async (fastify) => {
    const requestPermissions = new WeakMap<object, Permission[]>();

    fastify.decorateRequest("auth", {
        getter: () => auth,
    });
    fastify.decorateRequest("session", undefined);
    fastify.decorateRequest("user", undefined);
    fastify.decorateRequest("permissions", {
        getter(this: object) {
            return requestPermissions.get(this) ?? [];
        },
        setter(this: object, permissions: Permission[]) {
            requestPermissions.set(this, permissions);
        },
    });

    fastify.decorate("authenticate", async (request, reply) => {
        if (!request.session) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    });

    fastify.decorate("authorize", (roles: string[]) => {
        return async (request: any, reply: any) => {
            if (!request.session) {
                return reply.status(401).send({ message: "Unauthorized" });
            }

            const normalizedRequiredRoles = roles
                .map((role) => role.toUpperCase())
                .filter((role): role is (typeof adminRoles)[number] =>
                    (adminRoles as readonly string[]).includes(role),
                );

            if (!normalizedRequiredRoles.length) {
                return reply.status(500).send({ message: "Server authorization misconfiguration" });
            }

            if (!hasRoleAccess(request.user?.role, normalizedRequiredRoles)) {
                return reply.status(403).send({ message: "Forbidden" });
            }
        };
    });

    fastify.decorate("authorizePermission", (requiredPermissions: Permission | Permission[]) => {
        const permissionList = Array.isArray(requiredPermissions)
            ? requiredPermissions
            : [requiredPermissions];

        return async (request: any, reply: any) => {
            if (!request.session) {
                return reply.status(401).send({ message: "Unauthorized" });
            }

            if (!(await hasAnyPermissionAsync(request.user?.role, permissionList))) {
                return reply.status(403).send({ message: "Forbidden" });
            }
        };
    });

    fastify.addHook("preHandler", async (request, reply) => {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(request.headers),
        });

        if (session) {
            request.session = session.session;
            request.user = session.user;
            request.permissions = await getPermissionsForRoleAsync(session.user?.role);
            const normalizedRole = normalizeAdminRole(session.user?.role);
            if (normalizedRole) {
                request.user.role = normalizedRole;
            }
        } else {
            request.permissions = [];
        }
    });
});
