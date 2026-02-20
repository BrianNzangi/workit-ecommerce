import { createAuthClient } from "better-auth/react";

const authBaseURL =
    process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || "");

export const authClient = createAuthClient({
    baseURL: authBaseURL,
    fetchOptions: {
        credentials: "include",
    },
});
