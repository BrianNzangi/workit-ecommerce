import { handlers } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const GET = (req: Request) => handlers.GET(req as unknown as NextRequest);
export const POST = (req: Request) => handlers.POST(req as unknown as NextRequest);
