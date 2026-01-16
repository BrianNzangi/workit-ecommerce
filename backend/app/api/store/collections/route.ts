import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CollectionService } from '@/lib/services/collection.service';

const collectionService = new CollectionService(prisma);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');
        const includeChildren = searchParams.get('includeChildren') === 'true';
        const take = searchParams.get('take') ? parseInt(searchParams.get('take')!) : undefined;
        const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined;

        const collections = await collectionService.getCollections({
            parentId: parentId === 'null' ? null : parentId || undefined,
            includeChildren,
            take,
            skip,
        });

        // Filter to only return enabled collections for storefront
        const enabledCollections = collections
            .filter(c => c.enabled)
            .map((collection: any) => ({
                ...collection,
                // Filter children to only enabled ones
                children: collection.children?.filter((child: any) => child.enabled) || [],
            }));

        return NextResponse.json(enabledCollections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collections' },
            { status: 500 }
        );
    }
}
