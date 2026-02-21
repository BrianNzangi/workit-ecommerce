import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const explicitAuthBaseUrl = process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim();
const explicitAuthBasePath = process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.trim();

const authBaseURL =
    explicitAuthBaseUrl ||
    browserOrigin ||
    process.env.NEXT_PUBLIC_FRONTEND_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BETTER_AUTH_URL ||
    "";

const authBasePath =
    explicitAuthBasePath || "/api/auth";

export const authClient = createAuthClient({
    baseURL: authBaseURL,
    basePath: authBasePath,
    fetchOptions: {
        credentials: "include",
    },
    plugins: [
        emailOTPClient(),
    ],
});

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;
