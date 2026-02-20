// auth.ts
import dotenv from "dotenv";
dotenv.config();

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "./db.js";

const splitOrigins = (value?: string): string[] =>
    (value ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const configuredOrigins = Array.from(
    new Set([
        ...splitOrigins(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
        ...splitOrigins(process.env.CORS_ORIGIN),
        ...splitOrigins(process.env.FRONTEND_URL),
        ...splitOrigins(process.env.ADMIN_URL),
    ]),
);

if (!configuredOrigins.length && process.env.NODE_ENV !== "production") {
    configuredOrigins.push("http://localhost:3000", "http://localhost:3002");
}

const authBaseUrl = process.env.BETTER_AUTH_URL || process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");
const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    basePath: "/auth",
    ...(authBaseUrl ? { baseURL: authBaseUrl } : {}),

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    emailAndPassword: {
        enabled: true,
        password: {
            async hash(password: string) {
                const bcrypt = await import("bcryptjs");
                return await bcrypt.hash(password, 10);
            },
            async verify({ password, hash }: { password: string; hash: string }) {
                const bcrypt = await import("bcryptjs");
                return await bcrypt.compare(password, hash);
            },
        },
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },

    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "ADMIN" },
            firstName: { type: "string" },
            lastName: { type: "string" },
        },
    },

    ...(configuredOrigins.length ? { trustedOrigins: configuredOrigins } : {}),

    cors: {
        enabled: true,
        ...(configuredOrigins.length ? { allowedOrigins: configuredOrigins } : {}),
    },

    ...(frontendUrl ? { errorRedirect: `${frontendUrl}/auth/error` } : {}),

    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 7,
        },
    },

    cookies: {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        httpOnly: true,
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
