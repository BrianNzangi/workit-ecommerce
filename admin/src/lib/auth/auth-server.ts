import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@workit/db";

const splitOrigins = (value?: string): string[] =>
    (value ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const configuredOrigins = Array.from(
    new Set([
        ...splitOrigins(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
        ...splitOrigins(process.env.CORS_ORIGIN),
        ...splitOrigins(process.env.NEXT_PUBLIC_ADMIN_BASE_URL),
        ...splitOrigins(process.env.ADMIN_URL),
    ]),
);

if (!configuredOrigins.length && process.env.NODE_ENV !== "production") {
    configuredOrigins.push("http://localhost:3002", "http://127.0.0.1:3002");
}

const authBaseUrl =
    process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_ADMIN_BASE_URL ||
    process.env.ADMIN_URL ||
    process.env.BETTER_AUTH_URL;
const authCookiePrefix =
    process.env.BETTER_AUTH_COOKIE_PREFIX?.trim() ||
    process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX?.trim() ||
    "admin-auth";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "pvhf6y7u8i9o0p1q2r3s4t5u6v7w8x9y",
    ...(authBaseUrl ? { baseURL: authBaseUrl } : {}),

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    emailAndPassword: {
        enabled: true,
        password: {
            hash: async (password: string) => {
                const bcrypt = await import("bcryptjs");
                return await bcrypt.hash(password, 10);
            },
            verify: async ({ password, hash }: { password: string; hash: string }) => {
                const bcrypt = await import("bcryptjs");
                return await bcrypt.compare(password, hash);
            },
        },
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "ADMIN",
            },
            firstName: {
                type: "string",
            },
            lastName: {
                type: "string",
            },
        },
    },

    ...(configuredOrigins.length ? { trustedOrigins: configuredOrigins } : {}),
    advanced: {
        cookiePrefix: authCookiePrefix,
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
