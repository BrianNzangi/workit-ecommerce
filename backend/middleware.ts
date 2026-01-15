import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Initialize NextAuth
const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Handle preflight requests for Storefront API
    if (req.method === 'OPTIONS' && pathname.startsWith('/api/store')) {
        const res = new NextResponse(null, { status: 200 });
        const origin = req.headers.get('origin') || process.env.STOREFRONT_URL || "http://localhost:3000";

        // Add CORS headers for preflight
        res.headers.set("Access-Control-Allow-Origin", origin);
        res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.headers.set("Access-Control-Allow-Credentials", "true");

        return res;
    }

    // Protect admin routes (except login)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        // req.auth is automatically populated by the auth wrapper
        if (!req.auth || !req.auth.user) {
            const loginUrl = new URL('/admin/login', req.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Protect admin API routes
    if (pathname.startsWith('/api/admin')) {
        if (!req.auth || !req.auth.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const res = NextResponse.next();

    // Add CORS headers to responses for Storefront API
    if (pathname.startsWith('/api/store')) {
        const origin = req.headers.get('origin') || process.env.STOREFRONT_URL || "http://localhost:3000";
        res.headers.set("Access-Control-Allow-Origin", origin);
        res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return res;
});

export const config = {
    matcher: [
        "/admin/:path*",       // Protect admin pages
        "/api/admin/:path*",   // Protect admin API routes
        "/api/store/:path*",   // CORS for store API
        "/api/graphql"         // Admin GraphQL endpoint
    ],
};
