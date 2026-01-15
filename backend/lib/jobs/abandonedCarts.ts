import { prisma } from '@/lib/prisma';

/**
 * Mark carts as abandoned after 2 hours of inactivity
 * @returns Number of carts marked as abandoned
 */
export async function markAbandonedCarts(): Promise<number> {
    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const result = await prisma.abandonedCart.updateMany({
            where: {
                lastUpdated: {
                    lt: twoHoursAgo,
                },
                isAbandoned: false,
                isConverted: false,
            },
            data: {
                isAbandoned: true,
                abandonedAt: new Date(),
            },
        });

        console.log(`Marked ${result.count} carts as abandoned`);
        return result.count;
    } catch (error) {
        console.error('Error marking abandoned carts:', error);
        throw error;
    }
}

/**
 * Mark a cart as converted when it becomes an order
 * @param sessionId - The cart session ID
 */
export async function markCartAsConverted(sessionId: string): Promise<void> {
    try {
        await prisma.abandonedCart.update({
            where: { sessionId },
            data: {
                isConverted: true,
                isAbandoned: false,
            },
        });
    } catch (error) {
        console.error('Error marking cart as converted:', error);
        throw error;
    }
}

/**
 * Get abandoned cart statistics
 */
export async function getAbandonedCartStats() {
    try {
        const stats = await prisma.abandonedCart.aggregate({
            where: { isAbandoned: true, isConverted: false },
            _count: true,
            _sum: { totalValue: true },
            _avg: { totalValue: true },
        });

        return {
            totalCarts: stats._count,
            totalValue: stats._sum.totalValue || 0,
            averageValue: stats._avg.totalValue || 0,
        };
    } catch (error) {
        console.error('Error getting abandoned cart stats:', error);
        throw error;
    }
}
