import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch marketing statistics
        const [
            totalCampaigns,
            activeCampaigns,
            totalSubscribers,
            emailsSent,
        ] = await Promise.all([
            prisma.marketingCampaign.count(),
            prisma.marketingCampaign.count({
                where: { status: 'ACTIVE' },
            }),
            prisma.marketingSubscriber.count({
                where: { status: 'SUBSCRIBED' },
            }),
            prisma.marketingEmail.count({
                where: { status: 'SENT' },
            }),
        ]);

        // Calculate aggregate metrics
        const emailMetrics = await prisma.marketingEmail.aggregate({
            _avg: {
                openRate: true,
                clickRate: true,
            },
            _sum: {
                revenue: true,
            },
        });

        const stats = {
            totalCampaigns,
            activeCampaigns,
            totalSubscribers,
            emailsSent,
            openRate: emailMetrics._avg.openRate || 0,
            clickRate: emailMetrics._avg.clickRate || 0,
            conversionRate: 0, // Will be calculated based on orders
            revenue: emailMetrics._sum.revenue || 0,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching marketing stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch marketing statistics' },
            { status: 500 }
        );
    }
}
