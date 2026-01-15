import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { HomepageCollectionService } from '@/lib/services/homepage-collection.service';

const homepageCollectionService = new HomepageCollectionService(prisma);

export async function POST(
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
        const { productId, sortOrder } = body;

        if (!productId) {
            return NextResponse.json(
                { error: 'Missing required field: productId' },
                { status: 400 }
            );
        }

        const result = await homepageCollectionService.addProductToHomepageCollection(
            id,
            productId,
            sortOrder
        );

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error('Error adding product to homepage collection:', error);
        if (error.message?.includes('duplicate') || error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Product already in collection' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to add product to homepage collection' },
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
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Missing required query param: productId' },
                { status: 400 }
            );
        }

        await homepageCollectionService.removeProductFromHomepageCollection(
            id,
            productId
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error removing product from homepage collection:', error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Association not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to remove product from homepage collection' },
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
        const { productOrders } = body; // Array<{ productId: string; sortOrder: number }>

        if (!productOrders || !Array.isArray(productOrders)) {
            return NextResponse.json(
                { error: 'Invalid body: productOrders array required' },
                { status: 400 }
            );
        }

        await homepageCollectionService.reorderHomepageCollectionProducts(
            id,
            productOrders
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error reordering homepage collection products:', error);
        return NextResponse.json(
            { error: 'Failed to reorder products' },
            { status: 500 }
        );
    }
}
