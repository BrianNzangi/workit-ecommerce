const explicitCsrfCookieName = process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME?.trim();
const explicitCsrfHeaderName = process.env.NEXT_PUBLIC_CSRF_HEADER_NAME?.trim();
const explicitAuthBaseUrl = process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim();
const explicitAuthBasePath = process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.trim();

export const CSRF_COOKIE_NAME = explicitCsrfCookieName || "XSRF-TOKEN";
export const CSRF_HEADER_NAME = explicitCsrfHeaderName || "x-xsrf-token";
export const SAFE_HTTP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

let csrfRefreshPromise: Promise<string | null> | null = null;

export const getCookieValue = (name: string) => {
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

const generateCsrfToken = () => {
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
    throw new Error("Crypto API unavailable - cannot generate secure CSRF token");
};

const getAuthBaseUrl = () => {
    if (typeof window !== "undefined") {
        return explicitAuthBaseUrl || window.location.origin;
    }

    return explicitAuthBaseUrl ||
        process.env.NEXT_PUBLIC_FRONTEND_BASE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "";
};

const getSessionUrl = () => {
    const authBasePath = explicitAuthBasePath || "/api/auth";
    const basePath = authBasePath.endsWith("/") ? authBasePath.slice(0, -1) : authBasePath;
    const path = `${basePath}/get-session`;
    const authBaseUrl = getAuthBaseUrl();

    if (authBaseUrl) {
        try {
            return new URL(path, authBaseUrl).toString();
        } catch {
            return path;
        }
    }

    return path;
};

export const ensureCsrfToken = async () => {
    if (typeof window === "undefined") return null;

    const existingToken = getCookieValue(CSRF_COOKIE_NAME);
    if (existingToken) return existingToken;

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

    const refreshedToken = await csrfRefreshPromise;
    return refreshedToken;
};
