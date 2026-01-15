import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const campaign = await prisma.marketingCampaign.findUnique({
            where: {
                id,
            },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return NextResponse.json(
            { error: 'Failed to fetch campaign' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.marketingCampaign.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        return NextResponse.json(
            { error: 'Failed to delete campaign' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        const campaign = await prisma.marketingCampaign.update({
            where: {
                id,
            },
            data: {
                name,
                subject,
                content,
                recipientSegment: recipientSegment || null,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                sentAt: sentAt ? new Date(sentAt) : null,
                status: status || 'DRAFT',
            },
        });

        return NextResponse.json(campaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        return NextResponse.json(
            { error: 'Failed to update campaign' },
            { status: 500 }
        );
    }
}
