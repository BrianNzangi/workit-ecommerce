const DEV_BETTER_AUTH_SECRET = "workit-local-dev-better-auth-secret";

let warnedAboutFallback = false;

export function getBetterAuthSecret(): string {
    const configuredSecret = process.env.BETTER_AUTH_SECRET?.trim();

    if (configuredSecret) {
        return configuredSecret;
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error("BETTER_AUTH_SECRET is required in production");
    }

    if (!warnedAboutFallback) {
        warnedAboutFallback = true;
        console.warn(
            "BETTER_AUTH_SECRET is not set; using a local development fallback secret."
        );
    }

    return DEV_BETTER_AUTH_SECRET;
}
