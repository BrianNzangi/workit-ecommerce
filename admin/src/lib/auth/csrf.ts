const explicitCsrfCookieName = process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME?.trim();
const explicitCsrfHeaderName = process.env.NEXT_PUBLIC_CSRF_HEADER_NAME?.trim();

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

export const setCookieValue = (name: string, value: string) => {
    if (typeof document === "undefined") return;
    const secure = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax${secure ? "; secure" : ""}`;
};

export const generateCsrfToken = () => {
    if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getSessionUrl = (authBasePath: string, authBaseURL: string) => {
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

export const ensureCsrfToken = async (sessionUrl: string) => {
    if (typeof window === "undefined") return null;

    const existingToken = getCookieValue(CSRF_COOKIE_NAME);
    if (existingToken) {
        return existingToken;
    }

    if (!csrfRefreshPromise) {
        csrfRefreshPromise = fetch(sessionUrl, {
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
    if (refreshedToken) return refreshedToken;

    const fallback = generateCsrfToken();
    setCookieValue(CSRF_COOKIE_NAME, fallback);
    return fallback;
};
