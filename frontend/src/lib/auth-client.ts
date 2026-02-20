import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const isLocalBrowser = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(browserOrigin);
const explicitAuthBaseUrl = process.env.NEXT_PUBLIC_AUTH_BASE_URL;

const authBaseURL =
    explicitAuthBaseUrl ||
    (isLocalBrowser
        ? browserOrigin
        : process.env.NEXT_PUBLIC_BACKEND_URL ||
        (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || ""));

const authBasePath =
    process.env.NEXT_PUBLIC_AUTH_BASE_PATH ||
    (isLocalBrowser && !explicitAuthBaseUrl ? "/api/auth" : "/auth");

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
