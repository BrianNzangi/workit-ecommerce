import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "./db.js";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "pvhf6y7u8i9o0p1q2r3s4t5u6v7w8x9y",
    basePath: "/auth",

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
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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

    trustedOrigins: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : [
            "https://admin.workit.co.ke",
            "http://localhost:3002",
            "http://localhost:3000",
            "http://localhost:4000",
        ],

    cors: {
        allowedOrigins: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",")
            : [
                "https://workit.co.ke",
                "https://admin.workit.co.ke",
                "http://localhost:3000",
                "http://localhost:3002",
            ],
        enabled: true,
    },

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
    errorRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/auth/error` : "http://localhost:3000/auth/error",

    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        },
    },

    cookies: {
        secure: true,
        sameSite: "none",
        httpOnly: true,
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
