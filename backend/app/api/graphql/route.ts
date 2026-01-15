import { NextRequest, NextResponse } from 'next/server';
import { yoga } from '@/lib/graphql/server';

// Wrap the yoga handler to satisfy Next.js 15 Route Handler types
// The second argument 'context' is required by Next.js 15 but not strictly used by Yoga here
const handler = async (request: NextRequest, context: any) => {
    return yoga.handleRequest(request, context);
};

export { handler as GET, handler as POST, handler as OPTIONS };
