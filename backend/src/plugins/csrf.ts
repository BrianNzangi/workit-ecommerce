import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import crypto from "crypto";
import type { FastifyReply, FastifyRequest } from "fastify";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const DEFAULT_COOKIE_NAME = "XSRF-TOKEN";
const DEFAULT_HEADER_NAMES = ["x-xsrf-token", "x-csrf-token", "csrf-token"];

const splitEnvList = (value?: string): string[] =>
    (value ?? "")
        .split(",")
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);

export default fp(async (fastify) => {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain = process.env.BETTER_AUTH_COOKIE_DOMAIN?.trim();
    const authCookiePrefix = process.env.BETTER_AUTH_COOKIE_PREFIX?.trim() || "admin-auth";
    const storefrontCookiePrefix =
        process.env.STOREFRONT_AUTH_COOKIE_PREFIX?.trim() ||
        process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX?.trim() ||
        "store-auth";

    const csrfCookieName = process.env.CSRF_COOKIE_NAME?.trim() || DEFAULT_COOKIE_NAME;
    const envHeaderNames = splitEnvList(process.env.CSRF_HEADER_NAMES);
    const headerNames = envHeaderNames.length ? envHeaderNames : DEFAULT_HEADER_NAMES;

    await fastify.register(cookie);

    const cookieOptions = {
        path: "/",
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        httpOnly: false,
        ...(cookieDomain ? { domain: cookieDomain } : {}),
    } as const;

    const ensureCsrfCookie = (reply: FastifyReply, current?: string) => {
        if (current) return;
        const token = crypto.randomBytes(32).toString("hex");
        reply.setCookie(csrfCookieName, token, cookieOptions);
    };

    const shouldProtect = (request: FastifyRequest) => {
        // Auth endpoints use credential-based auth (email/password or tokens),
        // not cookies — CSRF protection doesn't apply to them.
        const authPaths = ["/auth/", "/api/auth/"];
        if (authPaths.some((p) => request.url.startsWith(p))) {
            return false;
        }

        const cookieNames = Object.keys(request.cookies || {});
        return cookieNames.some(
            (name) => name.startsWith(authCookiePrefix) || name.startsWith(storefrontCookiePrefix),
        );
    };

    fastify.addHook("onRequest", async (request, reply) => {
        if (SAFE_METHODS.has(request.method)) {
            ensureCsrfCookie(reply, request.cookies?.[csrfCookieName]);
            return;
        }

        if (!shouldProtect(request)) {
            return;
        }

        const csrfCookie = request.cookies?.[csrfCookieName];
        if (!csrfCookie) {
            return reply.status(403).send({ message: "Missing CSRF token" });
        }

        let headerToken: string | undefined;
        for (const name of headerNames) {
            const value = request.headers[name] as string | undefined;
            if (value) {
                headerToken = value;
                break;
            }
        }

        if (!headerToken || headerToken !== csrfCookie) {
            return reply.status(403).send({ message: "Invalid CSRF token" });
        }
    });
});
