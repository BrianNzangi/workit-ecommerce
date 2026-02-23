import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const cookiePrefix =
    process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX?.trim() ||
    process.env.AUTH_COOKIE_PREFIX?.trim() ||
    "store-auth";

export function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request, { cookiePrefix });

    // Example: Protect /account routes
    if (request.nextUrl.pathname.startsWith("/account") && !sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * 1. /api (internal API routes)
         * 2. /_next (Next.js internals)
         * 3. /static (static files)
         * 4. favicon.ico, sitemap.xml, robots.txt
         */
        '/((?!api|_next|static|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
