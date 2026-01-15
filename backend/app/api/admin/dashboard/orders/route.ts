import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

type TimeRange = '24h' | '7d' | '1m' | '3m' | '6m' | '12m';

function getDateRange(range: TimeRange): { start: Date; previousStart: Date; previousEnd: Date } {
    const now = new Date();
    const start = new Date();
    let previousStart = new Date();
    let previousEnd = new Date();

    switch (range) {
        case '24h':
            start.setHours(now.getHours() - 24);
            previousStart.setHours(now.getHours() - 48);
            previousEnd.setHours(now.getHours() - 24);
            break;
        case '7d':
            start.setDate(now.getDate() - 7);
            previousStart.setDate(now.getDate() - 14);
            previousEnd.setDate(now.getDate() - 7);
            break;
        case '1m':
            start.setMonth(now.getMonth() - 1);
            previousStart.setMonth(now.getMonth() - 2);
            previousEnd.setMonth(now.getMonth() - 1);
            break;
        case '3m':
            start.setMonth(now.getMonth() - 3);
            previousStart.setMonth(now.getMonth() - 6);
            previousEnd.setMonth(now.getMonth() - 3);
            break;
        case '6m':
            start.setMonth(now.getMonth() - 6);
            previousStart.setMonth(now.getMonth() - 12);
            previousEnd.setMonth(now.getMonth() - 6);
            break;
        case '12m':
            start.setFullYear(now.getFullYear() - 1);
            previousStart.setFullYear(now.getFullYear() - 2);
            previousEnd.setFullYear(now.getFullYear() - 1);
            break;
    }

    return { start, previousStart, previousEnd };
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const range = (searchParams.get('range') || '7d') as TimeRange;
        const { start, previousStart, previousEnd } = getDateRange(range);

        // Get current period orders
        const currentOrders = await prisma.order.count({
            where: {
                createdAt: {
                    gte: start,
                },
            },
        });

        // Get previous period orders
        const previousOrders = await prisma.order.count({
            where: {
                createdAt: {
                    gte: previousStart,
                    lt: previousEnd,
                },
            },
        });

        const percentageChange = previousOrders > 0
            ? ((currentOrders - previousOrders) / previousOrders) * 100
            : 0;

        return NextResponse.json({
            current: currentOrders,
            previous: previousOrders,
            percentageChange,
        });
    } catch (error) {
        console.error('Error fetching orders data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders data' },
            { status: 500 }
        );
    }
}
