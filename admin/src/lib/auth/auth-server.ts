import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@workit/db";

/**
 * Better Auth Server Instance
 * Use this for server-side authentication operations
 */
export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "pvhf6y7u8i9o0p1q2r3s4t5u6v7w8x9y",

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),

    emailAndPassword: {
        enabled: true,
        password: {
            /**
             * Hash password using bcrypt (10 rounds)
             */
            hash: async (password: string) => {
                const bcrypt = await import("bcryptjs");
                return await bcrypt.hash(password, 10);
            },

            /**
             * Verify password using bcrypt
             */
            verify: async ({ password, hash }: { password: string; hash: string }) => {
                // Check if the hash is a valid bcrypt hash
                if (!hash.startsWith("$2")) {
                    console.log("Invalid bcrypt hash prefix, expected $2...");
                    return false;
                }
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
        "http://127.0.0.1:3002",
    ],

    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3002",
});

/**
 * Type inference helpers
 */
export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
