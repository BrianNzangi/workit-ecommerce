import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Vendure uses session cookies for authentication
// No middleware needed as Vendure handles sessions automatically
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
