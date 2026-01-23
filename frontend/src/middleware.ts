import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware();

// Match all routes except for static files and APIs
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
