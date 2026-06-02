import fp from "fastify-plugin";
import { auth } from "../lib/auth.js";
import { storefrontAuth } from "../lib/storefront-auth.js";
import { fromNodeHeaders } from "better-auth/node";
import {
    adminRoles,
    getPermissionsForRoleAsync,
    hasAnyPermissionAsync,
    hasRoleAccess,
    normalizeAdminRole,
} from "../lib/rbac.js";
import type { Permission } from "../lib/rbac.js";
import { db, schema, eq } from "../lib/db.js";

declare module "fastify" {
    interface FastifyRequest {
        auth: typeof auth;
        session: any | null;
        user: any | null;
        storefrontSession: any | null;
        storefrontUser: any | null;
        permissions: Permission[];
    }
    interface FastifyInstance {
        authenticate: (request: any, reply: any) => Promise<void>;
        authenticateStorefront: (request: any, reply: any) => Promise<void>;
        optionalStorefrontAuth: (request: any, reply: any) => Promise<void>;
        authorize: (roles: string[]) => (request: any, reply: any) => Promise<void>;
        authorizePermission: (permissions: Permission | Permission[]) => (request: any, reply: any) => Promise<void>;
    }
}

export default fp(async (fastify) => {
    const requestPermissions = new WeakMap<object, Permission[]>();
    const resolveAdminSession = async (request: any) => {
        if (request.session) {
            return request.session;
        }

        const session = await auth.api.getSession({
            headers: fromNodeHeaders(request.raw.headers),
        });

        if (session) {
            request.session = session.session;
            request.user = session.user;

            // Fallback: if Better Auth did not include the role additionalField,
            // read it directly from the DB.
            let role = session.user?.role;
            if (!normalizeAdminRole(role)) {
                const [dbUser] = await db
                    .select({ role: schema.users.role })
                    .from(schema.users)
                    .where(eq(schema.users.id, session.user.id))
                    .limit(1);
                if (dbUser?.role) {
                    role = dbUser.role;
                }
            }

            request.user.role = role;
            request.permissions = await getPermissionsForRoleAsync(role);
        } else {
            request.session = null;
            request.user = null;
            request.permissions = [];
        }

        return request.session;
    };

    fastify.decorateRequest("auth", {
        getter: () => auth,
    });
    fastify.decorateRequest("session", undefined);
    fastify.decorateRequest("user", undefined);
    fastify.decorateRequest("storefrontSession", undefined);
    fastify.decorateRequest("storefrontUser", undefined);
    fastify.decorateRequest("permissions", {
        getter(this: object) {
            return requestPermissions.get(this) ?? [];
        },
        setter(this: object, permissions: Permission[]) {
            requestPermissions.set(this, permissions);
        },
    });

    fastify.decorate("authenticate", async (request, reply) => {
        await resolveAdminSession(request);

        if (!request.session) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    });

    fastify.decorate("authenticateStorefront", async (request, reply) => {
        const storefrontSession = await storefrontAuth.api.getSession({
            headers: fromNodeHeaders(request.raw.headers),
        });

        if (storefrontSession) {
            request.storefrontSession = storefrontSession.session;
            request.storefrontUser = storefrontSession.user;
        } else {
            request.storefrontSession = null;
            request.storefrontUser = null;
        }

        if (!request.storefrontSession) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    });

    fastify.decorate("optionalStorefrontAuth", async (request, reply) => {
        const storefrontSession = await storefrontAuth.api.getSession({
            headers: fromNodeHeaders(request.raw.headers),
        });

        if (storefrontSession) {
            request.storefrontSession = storefrontSession.session;
            request.storefrontUser = storefrontSession.user;
        } else {
            request.storefrontSession = null;
            request.storefrontUser = null;
        }
    });

    fastify.decorate("authorize", (roles: string[]) => {
        return async (request: any, reply: any) => {
            await resolveAdminSession(request);

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
            await resolveAdminSession(request);

            if (!request.session) {
                return reply.status(401).send({ message: "Unauthorized" });
            }

            if (!(await hasAnyPermissionAsync(request.user?.role, permissionList))) {
                return reply.status(403).send({ message: "Forbidden" });
            }
        };
    });

    fastify.addHook("preHandler", async (request, reply) => {
        await resolveAdminSession(request);
    });
});
