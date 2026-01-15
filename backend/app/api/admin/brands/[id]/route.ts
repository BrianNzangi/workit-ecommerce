import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { BrandService } from '@/lib/services/brand.service';

const brandService = new BrandService(prisma);

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

        const brand = await brandService.getBrandById(id);

        if (!brand) {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(brand);
    } catch (error) {
        console.error('Error fetching brand:', error);
        return NextResponse.json(
            { error: 'Failed to fetch brand' },
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

        const brand = await brandService.updateBrand(id, body);

        return NextResponse.json(brand);
    } catch (error: any) {
        console.error('Error updating brand:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Brand with this name or slug already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update brand' },
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

        await brandService.deleteBrand(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting brand:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete brand' },
            { status: 500 }
        );
    }
}
