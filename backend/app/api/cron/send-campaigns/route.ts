import { NextResponse } from 'next/server';
import { sendScheduledCampaigns } from '@/lib/jobs/sendCampaigns';

export async function GET(request: Request) {
    try {
        // Optional: Check for authorization header
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await sendScheduledCampaigns();

        return NextResponse.json(result, { status: result.success ? 200 : 500 });
    } catch (error) {
        console.error('Error in send-campaigns cron:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
