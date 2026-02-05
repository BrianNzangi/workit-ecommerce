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

    trustedOrigins: [
        "https://admin.workit.co.ke",
        "http://localhost:3002",
        "http://localhost:3000",
        "http://localhost:4000",
    ],

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",

    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
        },
    },
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
