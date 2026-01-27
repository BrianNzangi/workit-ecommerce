import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@workit/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
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
