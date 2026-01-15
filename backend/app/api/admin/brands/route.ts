import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { BrandService } from '@/lib/services/brand.service';

const brandService = new BrandService(prisma);

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, description, logoUrl, enabled } = body;

        // Validation
        if (!name) {
            return NextResponse.json(
                { error: 'Missing required field: name' },
                { status: 400 }
            );
        }

        const brand = await brandService.createBrand({
            name,
            slug,
            description,
            logoUrl,
            enabled,
        });

        return NextResponse.json(brand, { status: 201 });
    } catch (error: any) {
        console.error('Error creating brand:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Brand with this name or slug already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create brand' },
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
        const take = searchParams.get('take') ? parseInt(searchParams.get('take')!) : undefined;
        const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined;
        const enabled = searchParams.has('enabled') ? searchParams.get('enabled') === 'true' : undefined;

        const brands = await brandService.getBrands({
            take,
            skip,
            enabled,
        });

        return NextResponse.json(brands);
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json(
            { error: 'Failed to fetch brands' },
            { status: 500 }
        );
    }
}
