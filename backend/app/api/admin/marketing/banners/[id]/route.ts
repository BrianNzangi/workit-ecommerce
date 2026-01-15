import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { BannerService } from '@/lib/services/banner.service';

const bannerService = new BannerService(prisma);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const banner = await bannerService.getBanner(id);

        if (!banner) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
        }

        return NextResponse.json(banner);
    } catch (error) {
        console.error('Error fetching banner:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banner' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const banner = await bannerService.updateBanner(id, body);

        return NextResponse.json(banner);
    } catch (error: any) {
        console.error('Error updating banner:', error);

        if (error.message?.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        if (error.message?.includes('already exists')) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to update banner' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.banner.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting banner:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
        }
        return NextResponse.json(
            { error: 'Failed to delete banner' },
            { status: 500 }
        );
    }
}
