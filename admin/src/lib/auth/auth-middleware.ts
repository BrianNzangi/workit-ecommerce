import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth-server";

/**
 * Server-side auth guard
 * Use in API routes or Server Components
 */
export async function requireAuth(request?: NextRequest) {
    const session = await auth.api.getSession({
        headers: request?.headers || new Headers(),
    });

    if (!session) {
        throw new Error("Unauthorized: No active session");
    }

    return session;
}

/**
 * Check if user has admin role
 */
export async function requireAdmin(request?: NextRequest) {
    const session = await requireAuth(request);

    if (session.user.role !== "ADMIN") {
        throw new Error("Forbidden: Admin role required");
    }

    return session;
}

/**
 * Middleware for protecting routes
 */
export async function authMiddleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    // Redirect to login if not authenticated
    if (!session && !request.nextUrl.pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect to dashboard if authenticated and on login page
    if (session && request.nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}
