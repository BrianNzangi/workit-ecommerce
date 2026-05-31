import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const cookiePrefix =
    process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX?.trim() ||
    process.env.AUTH_COOKIE_PREFIX?.trim() ||
    "store-auth";

const PUBLIC_API_PREFIXES = [
    "/api/auth",
    "/api/store",
    "/api/products",
    "/api/collections",
    "/api/brands",
    "/api/blogs",
    "/api/search",
    "/api/home-collection",
    "/api/shipping-zones",
    "/api/coupons/validate",
    "/api/cart",
    "/api/checkout",
    "/api/paystack",
    "/api/meta",
    "/api/revalidate",
    "/fetch-pages",
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const PROTECTED_API_PREFIXES = [
    "/api/orders",
    "/api/customer",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = getSessionCookie(request, { cookiePrefix });

    // Redirect /brands to /brand
    if (pathname === "/brands" || pathname === "/brands/") {
        return NextResponse.redirect(new URL("/brand", request.url));
    }

    // Protect /account routes
    if (pathname.startsWith("/account") && !sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Protect sensitive API routes
    if (PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p)) && !sessionCookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow public API routes to pass through without session check
    if (pathname.startsWith("/api") && !isPublicPath(pathname) && !PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
        // Unknown API routes that are neither public nor explicitly protected — let them through
        // (they have their own auth checks internally)
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|static|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
