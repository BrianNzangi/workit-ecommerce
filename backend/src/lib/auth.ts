// auth.ts
import dotenv from "dotenv";
dotenv.config(); // load env before anything else

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "./db.js";

export const auth = betterAuth({
    // Global secret for signing cookies & sessions
    secret: process.env.BETTER_AUTH_SECRET!,
    basePath: "/auth",
    baseURL: process.env.BETTER_AUTH_URL || "https://api.workit.co.ke",

    // Database setup
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    // Email/password login
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

    // Social login providers
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },

    // User additional fields
    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "ADMIN" },
            firstName: { type: "string" },
            lastName: { type: "string" },
        },
    },

    // Trusted frontend origins (for Better Auth)
    trustedOrigins: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : [
            "https://workit.co.ke",
            "https://admin.workit.co.ke",
            "http://localhost:3000",
            "http://localhost:3002",
        ],

    // CORS settings
    cors: {
        enabled: true,
        allowedOrigins: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",")
            : [
                "https://workit.co.ke",
                "https://admin.workit.co.ke",
                "http://localhost:3000",
                "http://localhost:3002",
            ],
    },

    // Redirect users on error
    errorRedirect: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/auth/error`
        : "https://workit.co.ke/auth/error",

    // Session settings
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        },
    },

    // Cookie settings for cross-domain login
    cookies: {
        secure: true,        // required for HTTPS
        sameSite: "none",    // allow cross-domain (frontend → backend)
        httpOnly: true,      // prevent JS access
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];