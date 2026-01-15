import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { BannerService } from '@/lib/services/banner.service';
import { BannerPosition } from '@prisma/client';

const bannerService = new BannerService(prisma);

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const banner = await bannerService.createBanner(body);
        return NextResponse.json(banner, { status: 201 });
    } catch (error: any) {
        console.error('Error creating banner:', error);

        if (error.message?.includes('required') || error.message?.includes('must be')) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (error.message?.includes('already exists')) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        if (error.message?.includes('not found')) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(
            { error: error.message || 'Failed to create banner' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const position = searchParams.get('position') as BannerPosition | null;
        const enabled = searchParams.get('enabled') === 'true' ? true : searchParams.get('enabled') === 'false' ? false : undefined;

        const banners = await bannerService.getBanners({
            position: position || undefined,
            enabled
        });

        return NextResponse.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}
