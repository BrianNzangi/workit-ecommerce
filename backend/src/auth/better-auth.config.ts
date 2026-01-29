import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@workit/db";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "pvhf6y7u8i9o0p1q2r3s4t5u6v7w8x9y",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
});
