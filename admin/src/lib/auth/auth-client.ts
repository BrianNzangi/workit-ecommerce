"use client";

import { createAuthClient } from "better-auth/react";
import { normalizeAdminRole } from "./rbac";
import {
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
    SAFE_HTTP_METHODS,
    ensureCsrfToken,
    getCookieValue,
    getSessionUrl,
} from "./csrf";

/**
 * Better Auth Client Instance
 * Use this for client-side authentication operations
 */
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
const explicitAuthBaseUrl = process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim();
const explicitAuthBasePath = process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.trim();

// Use same-origin auth route by default so session cookies are scoped to the admin domain.
const authBaseURL =
    explicitAuthBaseUrl ||
    browserOrigin ||
    process.env.NEXT_PUBLIC_ADMIN_BASE_URL ||
    "";

const authBasePath = explicitAuthBasePath || "/api/auth";
const sessionUrl = getSessionUrl(authBasePath, authBaseURL);

export const authClient = createAuthClient({
    baseURL: authBaseURL,
    basePath: authBasePath,
    fetchOptions: {
        credentials: "include",
        async onRequest(context) {
            const method = String(context.method || "GET").toUpperCase();
            if (SAFE_HTTP_METHODS.has(method)) return;

            const token = (await ensureCsrfToken(sessionUrl)) || getCookieValue(CSRF_COOKIE_NAME);
            if (!token) return;

            const headers = context.headers instanceof Headers
                ? context.headers
                : new Headers(context.headers);

            if (!headers.has(CSRF_HEADER_NAME)) {
                headers.set(CSRF_HEADER_NAME, token);
            }

            return { ...context, headers };
        },
    },
});

/**
 * Export auth hooks for easy access
 */
export const {
    useSession,
    signIn,
    signUp,
    signOut,
} = authClient;

export const useUser = () => {
    const { data } = useSession();
    return data?.user;
};

/**
 * Custom hook for checking admin role
 */
export function useIsAdmin() {
    const { data: session } = useSession();
    return normalizeAdminRole((session?.user as any)?.role) !== null;
}

/**
 * Custom hook for getting full user name
 */
export function useFullName() {
    const { data: session } = useSession();
    const user = session?.user as any;

    if (!user?.firstName && !user?.lastName) {
        return user?.email || "Guest";
    }

    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
}
