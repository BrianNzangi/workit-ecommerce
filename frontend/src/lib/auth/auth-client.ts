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
    const secure = typeof window !== "undefined" && (window.location.protocol === "https:" || window.location.hostname !== "localhost");
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=strict${secure ? "; secure" : ""}`;
};

const generateToken = () => {
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
    throw new Error("Crypto API unavailable - cannot generate secure token");
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
    return token;
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
            if (!token) throw new Error("CSRF token unavailable");

            const headers = context.headers instanceof Headers
                ? context.headers
                : new Headers(context.headers);

            if (!headers.has(CSRF_HEADER_NAME)) {
                headers.set(CSRF_HEADER_NAME, token);
            }

            return { ...context, headers };
        },
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
