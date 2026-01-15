import { prisma } from '@/lib/prisma';

/**
 * Clean up old data to keep database optimized
 */
export async function cleanupOldData() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // Delete old abandoned carts (not converted, older than 30 days)
        const deletedCarts = await prisma.abandonedCart.deleteMany({
            where: {
                isConverted: false,
                lastUpdated: {
                    lt: thirtyDaysAgo,
                },
            },
        });

        // Delete old marketing emails (older than 90 days)
        const deletedEmails = await prisma.marketingEmail.deleteMany({
            where: {
                createdAt: {
                    lt: ninetyDaysAgo,
                },
            },
        });

        console.log(`🧹 Cleanup complete: ${deletedCarts.count} carts, ${deletedEmails.count} emails`);

        return {
            success: true,
            message: `Cleaned up ${deletedCarts.count} cart${deletedCarts.count !== 1 ? 's' : ''} and ${deletedEmails.count} email${deletedEmails.count !== 1 ? 's' : ''}`,
            count: deletedCarts.count + deletedEmails.count,
            details: {
                carts: deletedCarts.count,
                emails: deletedEmails.count,
            },
        };
    } catch (error) {
        console.error('Error cleaning up old data:', error);
        return {
            success: false,
            message: 'Failed to cleanup data',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
