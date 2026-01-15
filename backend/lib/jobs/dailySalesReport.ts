import { prisma } from '@/lib/prisma';

/**
 * Generate daily sales report
 */
export async function generateDailySalesReport() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Count orders created today
        const ordersToday = await prisma.order.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Calculate total revenue for today
        const ordersWithTotal = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            select: {
                total: true,
            },
        });

        const totalRevenue = ordersWithTotal.reduce((sum, order) => sum + order.total, 0);

        // Count new customers today
        const newCustomers = await prisma.customer.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        console.log(`📈 Daily Report: ${ordersToday} orders, KES ${(totalRevenue / 100).toFixed(2)}, ${newCustomers} new customers`);

        return {
            success: true,
            message: `Generated report: ${ordersToday} orders, ${newCustomers} new customers`,
            count: ordersToday,
            stats: {
                orders: ordersToday,
                revenue: totalRevenue,
                revenueFormatted: `KES ${(totalRevenue / 100).toFixed(2)}`,
                newCustomers,
            },
        };
    } catch (error) {
        console.error('Error generating daily sales report:', error);
        return {
            success: false,
            message: 'Failed to generate report',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
