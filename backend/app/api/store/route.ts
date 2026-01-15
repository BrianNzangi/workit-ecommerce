import { NextRequest } from "next/server";
import { storefrontYoga } from '@/lib/graphql/storefront-server';

// Wrap the yoga handler to satisfy Next.js 15 Route Handler types
const handler = async (request: NextRequest, context: any) => {
    return storefrontYoga.handleRequest(request, context);
};

export { handler as GET, handler as POST, handler as OPTIONS };
