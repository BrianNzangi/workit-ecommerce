import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db, schema } from "@workit/db";

const splitOrigins = (value?: string): string[] =>
    (value ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const configuredOrigins = Array.from(
    new Set([
        ...splitOrigins(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
        ...splitOrigins(process.env.CORS_ORIGIN),
        ...splitOrigins(process.env.NEXT_PUBLIC_APP_URL),
        ...splitOrigins(process.env.NEXT_PUBLIC_FRONTEND_BASE_URL),
        ...splitOrigins(process.env.FRONTEND_URL),
        ...splitOrigins(process.env.NEXT_PUBLIC_AUTH_BASE_URL),
        ...splitOrigins(process.env.ADMIN_URL),
    ]),
);

if (!configuredOrigins.length && process.env.NODE_ENV !== "production") {
    configuredOrigins.push("http://localhost:3000", "http://localhost:3002");
}

const authBaseUrl =
    process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_BASE_URL;
const authCookiePrefix =
    process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX?.trim() ||
    process.env.AUTH_COOKIE_PREFIX?.trim() ||
    "store-auth";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "pvhf6y7u8i9o0p1q2r3s4t5u6v7w8x9y",
    ...(authBaseUrl ? { baseURL: authBaseUrl } : {}),
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
                defaultValue: "CUSTOMER",
            },
            firstName: {
                type: "string",
            },
            lastName: {
                type: "string",
            },
        },
    },
    ...(configuredOrigins.length ? { trustedOrigins: configuredOrigins } : {}),
    advanced: {
        cookiePrefix: authCookiePrefix,
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                console.log(`Verification OTP sent to ${email}: ${otp} (Type: ${type})`);
            },
        }),
    ],
});
