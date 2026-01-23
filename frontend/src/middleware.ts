import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware();

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
