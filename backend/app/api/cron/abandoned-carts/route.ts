import { NextRequest, NextResponse } from 'next/server';
import { markAbandonedCarts } from '@/lib/jobs/abandonedCarts';

/**
 * Cron endpoint to mark abandoned carts
 * This endpoint should be called by a cron service (e.g., Vercel Cron, external cron)
 * Schedule: Every 15 minutes
 * 
 * For security, you can add an authorization header check:
 * if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 */
export async function GET(request: NextRequest) {
    try {
        // Optional: Add authorization check
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const count = await markAbandonedCarts();

        return NextResponse.json(
            {
                success: true,
                message: `Marked ${count} carts as abandoned`,
                count,
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in abandoned carts cron job:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
