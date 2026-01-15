import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CollectionService } from '@/lib/services/collection.service';

const collectionService = new CollectionService(prisma);

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, parentId, enabled, showInMostShopped, sortOrder, assetId } = body;

        // Validation
        if (!name) {
            return NextResponse.json(
                { error: 'Missing required field: name' },
                { status: 400 }
            );
        }

        // Create collection
        const collection = await collectionService.createCollection({
            name,
            description: description || null,
            parentId: parentId || null,
            enabled: enabled ?? true,
            showInMostShopped: showInMostShopped ?? false,
            sortOrder: sortOrder ?? 0,
            assetId: assetId || null,
        });

        return NextResponse.json(collection, { status: 201 });
    } catch (error: any) {
        console.error('Error creating collection:', error);

        if (error.message?.includes('duplicate') || error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Collection with this name already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create collection' },
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

        return NextResponse.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch collections' },
            { status: 500 }
        );
    }
}
