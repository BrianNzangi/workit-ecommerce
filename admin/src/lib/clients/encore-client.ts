import Client, { Local, Environment } from "@workit/api";

// Handle Encore environment name
const ENCORE_ENV = process.env.NEXT_PUBLIC_ENCORE_ENV;
const TARGET = ENCORE_ENV ? Environment(ENCORE_ENV) : Local;

/**
 * Encore Client Instance
 */
export const encoreClient = new Client(TARGET, {
    requestInit: {
        credentials: "include",
    },
    fetcher: async (url, init) => {
        // SSR Support: Forward cookies if on server
        if (typeof window === "undefined") {
            try {
                const { headers: nextHeaders } = await import("next/headers");
                const headersList = await nextHeaders();
                const cookie = headersList.get("cookie");
                if (cookie) {
                    const headers = new Headers(init?.headers);
                    headers.set("Cookie", cookie);
                    if (init) init.headers = headers;
                }
            } catch (e) {
                // Not in a request context
            }
        }
        return fetch(url, init);
    }
});
