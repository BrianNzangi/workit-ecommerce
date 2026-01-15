import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const campaigns = await prisma.marketingCampaign.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                _count: {
                    select: {
                        emails: true,
                    },
                },
            },
        });

        // Transform the data to include calculated metrics
        const campaignsWithMetrics = campaigns.map((campaign) => ({
            id: campaign.id,
            name: campaign.name,
            subject: campaign.subject,
            status: campaign.status,
            recipients: campaign._count.emails,
            openRate: campaign.openRate || 0,
            clickRate: campaign.clickRate || 0,
            sentAt: campaign.sentAt,
            scheduledAt: campaign.scheduledAt,
            createdAt: campaign.createdAt,
        }));

        return NextResponse.json(campaignsWithMetrics);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaigns' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            subject,
            preheader,
            fromName,
            fromEmail,
            replyTo,
            content,
            recipientSegment,
            scheduledAt,
            status,
            sentAt
        } = body;

        // Validate required fields
        if (!name || !subject || !content || !fromName || !fromEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const campaign = await prisma.marketingCampaign.create({
            data: {
                name,
                subject,
                content,
                recipientSegment: recipientSegment || null,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                sentAt: sentAt ? new Date(sentAt) : null,
                status: status || (scheduledAt ? 'SCHEDULED' : 'DRAFT'),
            },
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to create campaign' },
            { status: 500 }
        );
    }
}
