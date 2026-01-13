import { handleAuth } from '@workos-inc/authkit-nextjs';

// Redirect the user to `/` after successful sign in
// The redirect can be customized: `handleAuth({ returnPathname: '/foo' })`
export const GET = handleAuth();

console.log('CLIENT', process.env.WORKOS_CLIENT_ID);
console.log('KEY', process.env.WORKOS_API_KEY?.slice(0, 10));
