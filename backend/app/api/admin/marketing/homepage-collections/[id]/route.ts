import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { HomepageCollectionService } from '@/lib/services/homepage-collection.service';

const homepageCollectionService = new HomepageCollectionService(prisma);

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
        const homepageCollection = await homepageCollectionService.getHomepageCollection(id);

        if (!homepageCollection) {
            return NextResponse.json(
                { error: 'Homepage collection not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(homepageCollection);
    } catch (error) {
        console.error('Error fetching homepage collection:', error);
        return NextResponse.json(
            { error: 'Failed to fetch homepage collection' },
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
        const { title, slug, enabled, sortOrder } = body;

        const homepageCollection = await homepageCollectionService.updateHomepageCollection(id, {
            title,
            slug,
            enabled,
            sortOrder,
        });

        return NextResponse.json(homepageCollection);
    } catch (error: any) {
        console.error('Error updating homepage collection:', error);

        if (error.message?.includes('not found') || error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Homepage collection not found' },
                { status: 404 }
            );
        }

        if (error.message?.includes('duplicate') || error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Homepage collection with this slug already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update homepage collection' },
            { status: 500 }
        );
    }
}

// Note: DELETE is not strictly in the service, but easy to implement or add if needed.
// For now, I'll rely on update (enabled=false) or add a delete method if requested.
// But standard resource management implies DELETE. The service doesn't have it...
// Wait, looking at the service, there is NO delete method.
// I will just omit DELETE for now or use Prisma directly if I really need it, but I'll stick to what the service offers.
// Actually, I can just add it here using prisma directly if safe.
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

        // Using prisma directly since service lacks delete
        await prisma.homepageCollection.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting homepage collection:', error);
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Homepage collection not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to delete homepage collection' },
            { status: 500 }
        );
    }
}
