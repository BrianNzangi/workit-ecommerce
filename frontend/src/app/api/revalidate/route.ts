import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * API Route to purge Redis cache and Next.js data cache.
 * Secure this using INTERNAL_API_KEY header.
 */
export async function POST(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { path, tag, all } = await req.json();

        // 1. Clear Next.js Cache
        if (path) {
            await revalidatePath(path, 'page');
        }
        if (tag) {
            await revalidateTag(tag, 'max');
        }

        // 2. Clear Redis Cache
        if (redis) {
            if (all) {
                // Caution: This clears EVERYTHING in the Redis instance
                // Best to use a prefix if shared
                const keys = await redis.keys('proxy:*');
                if (keys.length > 0) {
                    await redis.del(...keys);
                }
            } else if (path) {
                // Clear specific proxy key
                await redis.del(`proxy:${path}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Revalidated ${all ? 'all' : path || tag}`
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
