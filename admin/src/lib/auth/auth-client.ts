"use client";

import { createAuthClient } from "better-auth/react";
import { normalizeAdminRole } from "./rbac";

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

const CSRF_COOKIE_NAME = process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME?.trim() || "XSRF-TOKEN";
const CSRF_HEADER_NAME = process.env.NEXT_PUBLIC_CSRF_HEADER_NAME?.trim() || "x-xsrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
let csrfRefreshPromise: Promise<string | null> | null = null;

const getCookieValue = (name: string) => {
    if (typeof document === "undefined") return null;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

const setCookieValue = (name: string, value: string) => {
    if (typeof document === "undefined") return;
    const secure = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax${secure ? "; secure" : ""}`;
};

const generateToken = () => {
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getSessionUrl = () => {
    const basePath = authBasePath.endsWith("/") ? authBasePath.slice(0, -1) : authBasePath;
    const path = `${basePath}/get-session`;
    if (authBaseURL) {
        try {
            return new URL(path, authBaseURL).toString();
        } catch {
            return path;
        }
    }
    return path;
};

const ensureCsrfToken = async () => {
    if (typeof window === "undefined") return null;
    if (getCookieValue(CSRF_COOKIE_NAME)) {
        return getCookieValue(CSRF_COOKIE_NAME);
    }
    if (!csrfRefreshPromise) {
        csrfRefreshPromise = fetch(getSessionUrl(), {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        })
            .catch(() => null)
            .then(() => getCookieValue(CSRF_COOKIE_NAME))
            .finally(() => {
                csrfRefreshPromise = null;
            });
    }
    const token = await csrfRefreshPromise;
    if (token) return token;
    const fallback = generateToken();
    setCookieValue(CSRF_COOKIE_NAME, fallback);
    return fallback;
};

export const authClient = createAuthClient({
    baseURL: authBaseURL,
    basePath: authBasePath,
    fetchOptions: {
        credentials: "include",
        async onRequest(context) {
            const method = String(context.method || "GET").toUpperCase();
            if (SAFE_METHODS.has(method)) return;

            const token = (await ensureCsrfToken()) || getCookieValue(CSRF_COOKIE_NAME);
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
