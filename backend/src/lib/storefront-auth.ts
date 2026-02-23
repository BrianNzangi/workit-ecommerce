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

const storefrontAuthBaseUrl =
    process.env.STOREFRONT_AUTH_URL ||
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_BASE_URL;

const storefrontCookiePrefix =
    process.env.STOREFRONT_AUTH_COOKIE_PREFIX?.trim() ||
    process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX?.trim() ||
    "store-auth";

const isProduction = process.env.NODE_ENV === "production";

export const storefrontAuth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    basePath: "/api/auth",
    ...(storefrontAuthBaseUrl ? { baseURL: storefrontAuthBaseUrl } : {}),

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "CUSTOMER" },
            firstName: { type: "string" },
            lastName: { type: "string" },
        },
    },

    ...(configuredOrigins.length ? { trustedOrigins: configuredOrigins } : {}),

    advanced: {
        cookiePrefix: storefrontCookiePrefix,
        useSecureCookies: isProduction,
    },
});
