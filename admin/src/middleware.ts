import { NextResponse, type NextRequest } from "next/server";

const LOGIN_URL = "/login";
const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get("admin-auth.session")?.value ||
        request.cookies.get("admin-auth.session-token")?.value;

    if (pathname.startsWith("/admin") && !sessionCookie) {
        const loginUrl = new URL(LOGIN_URL, request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/api/admin") && !sessionCookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|static|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
