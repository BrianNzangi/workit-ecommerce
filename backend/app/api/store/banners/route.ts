import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BannerService } from '@/lib/services/banner.service';
import { BannerPosition } from '@prisma/client';

const bannerService = new BannerService(prisma);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const position = searchParams.get('position') as BannerPosition | null;
        const enabled = searchParams.get('enabled') === 'true' ? true : searchParams.get('enabled') === 'false' ? false : undefined;

        const banners = await bannerService.getBanners({
            position: position || undefined,
            enabled: enabled ?? true // Only return enabled banners for store by default
        });

        return NextResponse.json(banners);
    } catch (error) {
        console.error('Error fetching store banners:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}
