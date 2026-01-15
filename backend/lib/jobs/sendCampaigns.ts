import { prisma } from '@/lib/prisma';

/**
 * Send scheduled marketing campaigns
 * Finds campaigns that are scheduled to be sent and processes them
 */
export async function sendScheduledCampaigns() {
    try {
        const now = new Date();

        // Find campaigns scheduled to be sent
        const scheduledCampaigns = await prisma.marketingCampaign.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: {
                    lte: now,
                },
            },
        });

        if (scheduledCampaigns.length === 0) {
            return {
                success: true,
                message: 'No campaigns to send',
                count: 0,
            };
        }

        let sentCount = 0;

        for (const campaign of scheduledCampaigns) {
            // Get subscribers based on segment (all for now)
            const subscribers = await prisma.marketingSubscriber.findMany({
                where: {
                    status: 'SUBSCRIBED',
                },
            });

            // Create email records for each subscriber
            const emailPromises = subscribers.map((subscriber) =>
                prisma.marketingEmail.create({
                    data: {
                        campaignId: campaign.id,
                        subscriberId: subscriber.id,
                        subject: campaign.subject,
                        content: campaign.content,
                        status: 'SENT',
                        sentAt: now,
                    },
                })
            );

            await Promise.all(emailPromises);

            // Update campaign status
            await prisma.marketingCampaign.update({
                where: { id: campaign.id },
                data: {
                    status: 'SENT',
                    sentAt: now,
                },
            });

            sentCount++;

            console.log(`✉️ Sent campaign: ${campaign.name} to ${subscribers.length} subscribers`);
        }

        return {
            success: true,
            message: `Sent ${sentCount} campaign${sentCount !== 1 ? 's' : ''}`,
            count: sentCount,
        };
    } catch (error) {
        console.error('Error sending scheduled campaigns:', error);
        return {
            success: false,
            message: 'Failed to send campaigns',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
