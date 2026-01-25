import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    // Better Auth uses a session token cookie
    const sessionToken = request.cookies.get("better-auth.session_token");

    // Example: Protect /account routes
    if (request.nextUrl.pathname.startsWith("/account") && !sessionToken) {
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
