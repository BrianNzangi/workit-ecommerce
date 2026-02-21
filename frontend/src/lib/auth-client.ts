import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const explicitAuthBaseUrl = process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim();
const explicitAuthBasePath = process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.trim();

const isLocalhostUrl = (value: string) => {
    try {
        const host = new URL(value).hostname;
        return host === "localhost" || host === "127.0.0.1" || host === "::1";
    } catch {
        return false;
    }
};

const shouldIgnoreLocalhostBaseUrlInProd =
    process.env.NODE_ENV === "production" &&
    !!browserOrigin &&
    !isLocalhostUrl(browserOrigin) &&
    !!explicitAuthBaseUrl &&
    isLocalhostUrl(explicitAuthBaseUrl);

const authBaseURL =
    (shouldIgnoreLocalhostBaseUrlInProd ? undefined : explicitAuthBaseUrl) ||
    browserOrigin ||
    process.env.NEXT_PUBLIC_FRONTEND_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
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
