import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@workit/db";
import bcrypt from "bcrypt";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "pvhf6y7u8i9o0p1q2r3s4t5u6v7w8x9y",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  password: {
    hash: async (password: string) => {
      console.log('[AUTH] Hashing password');
      return await bcrypt.hash(password, 10);
    },
    verify: async ({ password, hash }: { password: string; hash: string }) => {
      console.log('[AUTH] Verifying password');
      console.log('[AUTH] Hash from DB:', hash);
      console.log('[AUTH] Password length:', password.length);
      const result = await bcrypt.compare(password, hash);
      console.log('[AUTH] Verification result:', result);
      return result;
    }
  },
  emailAndPassword: {
    enabled: true,
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
