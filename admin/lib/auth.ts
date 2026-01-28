import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@workit/db";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "pvhf6y7u8i9o0p1q2r3s4t5u6v7w8x9y",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      async hash(password: string) {
        const bcrypt = await import("bcrypt");
        return await bcrypt.hash(password, 10);
      },
      async verify({ password, hash }: { password: string; hash: string }) {
        console.log(`[Auth Debug] Verifying password. Password provided: ${!!password}, Hash provided: ${!!hash}`);
        if (!hash) {
          console.error(`[Auth Debug] CRITICAL: Hash is missing for password verification!`);
        }
        const bcrypt = await import("bcrypt");
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
    }
  },
  trustedOrigins: [
    "https://admin.workit.co.ke",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
  ],
  baseURL: process.env.BETTER_AUTH_URL || "https://admin.workit.co.ke",
});

export type Session = typeof auth.$Infer.Session;
