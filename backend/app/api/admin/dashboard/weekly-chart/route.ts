import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, format } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || 'this_week'; // 'this_week' or 'last_week'

        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (range === 'last_week') {
            const lastWeek = subWeeks(now, 1);
            startDate = startOfWeek(lastWeek, { weekStartsOn: 0 }); // Sunday
            endDate = endOfWeek(lastWeek, { weekStartsOn: 0 });
        } else {
            startDate = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
            endDate = endOfWeek(now, { weekStartsOn: 0 });
        }

        // Fetch orders for the week
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                },
                state: {
                    not: 'CANCELLED'
                }
            },
            select: {
                createdAt: true,
                total: true
            }
        });

        // Initialize all days of the week with 0
        const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });
        const dailyData = daysInterval.map((day: Date) => {
            const dayName = format(day, 'EEE'); // Sun, Mon, etc.

            // Filter orders for this specific day
            const dayOrders = orders.filter(order =>
                format(order.createdAt, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );

            // Sum total
            const dayTotal = dayOrders.reduce((sum, order) => sum + order.total, 0);

            return {
                day: dayName,
                value: dayTotal
            };
        });

        return NextResponse.json(dailyData);

    } catch (error) {
        console.error('Error fetching weekly chart data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
