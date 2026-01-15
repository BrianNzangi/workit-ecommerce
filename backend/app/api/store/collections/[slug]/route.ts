import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CollectionService } from '@/lib/services/collection.service';

const collectionService = new CollectionService(prisma);

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        // Find collection by slug
        const collection = await prisma.collection.findUnique({
            where: { slug },
            include: {
                parent: true,
                children: {
                    where: { enabled: true },
                    orderBy: { sortOrder: 'asc' },
                },
                asset: true,
            },
        });

        if (!collection) {
            return NextResponse.json(
                { error: 'Collection not found' },
                { status: 404 }
            );
        }

        // Only return enabled collections to storefront
        if (!collection.enabled) {
            return NextResponse.json(
                { error: 'Collection not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(collection);
    } catch (error) {
        console.error('Error fetching collection:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collection' },
            { status: 500 }
        );
    }
}
