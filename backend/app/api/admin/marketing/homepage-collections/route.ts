import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { HomepageCollectionService } from '@/lib/services/homepage-collection.service';

const homepageCollectionService = new HomepageCollectionService(prisma);

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, slug, enabled, sortOrder } = body;

        // Validation
        if (!title) {
            return NextResponse.json(
                { error: 'Missing required field: title' },
                { status: 400 }
            );
        }

        // Create homepage collection
        const homepageCollection = await homepageCollectionService.createHomepageCollection({
            title,
            slug: slug || undefined,
            enabled: enabled ?? true,
            sortOrder: sortOrder ?? 0,
        });

        return NextResponse.json(homepageCollection, { status: 201 });
    } catch (error: any) {
        console.error('Error creating homepage collection:', error);

        if (error.message?.includes('duplicate') || error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Homepage collection with this slug already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create homepage collection' },
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

        const homepageCollections = await homepageCollectionService.getHomepageCollections({
            take,
            skip,
            enabled,
        });

        return NextResponse.json(homepageCollections);
    } catch (error) {
        console.error('Error fetching homepage collections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch homepage collections' },
            { status: 500 }
        );
    }
}
