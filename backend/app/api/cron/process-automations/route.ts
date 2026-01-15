import { NextResponse } from 'next/server';
import { processMarketingAutomations } from '@/lib/jobs/processAutomations';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await processMarketingAutomations();

        return NextResponse.json(result, { status: result.success ? 200 : 500 });
    } catch (error) {
        console.error('Error in process-automations cron:', error);
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
