import { prisma } from '@/lib/prisma';

/**
 * Update campaign analytics (open rates, click rates)
 */
export async function updateCampaignAnalytics() {
    try {
        // Get all campaigns that have been sent
        const campaigns = await prisma.marketingCampaign.findMany({
            where: {
                status: 'SENT',
            },
            include: {
                emails: true,
            },
        });

        if (campaigns.length === 0) {
            return {
                success: true,
                message: 'No campaigns to update',
                count: 0,
            };
        }

        let updatedCount = 0;

        for (const campaign of campaigns) {
            const totalEmails = campaign.emails.length;

            if (totalEmails === 0) continue;

            const openedEmails = campaign.emails.filter((email) => email.openedAt !== null).length;
            const clickedEmails = campaign.emails.filter((email) => email.clickedAt !== null).length;

            const openRate = (openedEmails / totalEmails) * 100;
            const clickRate = (clickedEmails / totalEmails) * 100;

            await prisma.marketingCampaign.update({
                where: { id: campaign.id },
                data: {
                    openRate,
                    clickRate,
                },
            });

            updatedCount++;
        }

        return {
            success: true,
            message: `Updated ${updatedCount} campaign${updatedCount !== 1 ? 's' : ''}`,
            count: updatedCount,
        };
    } catch (error) {
        console.error('Error updating campaign analytics:', error);
        return {
            success: false,
            message: 'Failed to update analytics',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
