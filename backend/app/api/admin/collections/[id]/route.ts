import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

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

        const collection = await prisma.collection.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                asset: true,
            },
        });

        if (!collection) {
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
        const { name, slug, description, parentId, enabled, showInMostShopped, sortOrder, assetId } = body;

        // Check if collection exists
        const existingCollection = await prisma.collection.findUnique({
            where: { id },
        });

        if (!existingCollection) {
            return NextResponse.json(
                { error: 'Collection not found' },
                { status: 404 }
            );
        }

        // Update collection
        const collection = await prisma.collection.update({
            where: { id },
            data: {
                name: name || existingCollection.name,
                slug: slug || existingCollection.slug,
                description: description !== undefined ? description : existingCollection.description,
                parentId: parentId !== undefined ? parentId : existingCollection.parentId,
                enabled: enabled !== undefined ? enabled : existingCollection.enabled,
                showInMostShopped: showInMostShopped !== undefined ? showInMostShopped : existingCollection.showInMostShopped,
                sortOrder: sortOrder !== undefined ? sortOrder : existingCollection.sortOrder,
                assetId: assetId !== undefined ? assetId : existingCollection.assetId,
            },
            include: {
                parent: true,
                children: true,
                asset: true,
            },
        });

        return NextResponse.json(collection);
    } catch (error: any) {
        console.error('Error updating collection:', error);

        if (error.message?.includes('duplicate') || error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Collection with this name or slug already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update collection' },
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

        // Check if collection exists
        const collection = await prisma.collection.findUnique({
            where: { id },
            include: {
                children: true,
                products: true,
            },
        });

        if (!collection) {
            return NextResponse.json(
                { error: 'Collection not found' },
                { status: 404 }
            );
        }

        // Check if collection has children
        if (collection.children && collection.children.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete collection with subcollections. Delete subcollections first.' },
                { status: 400 }
            );
        }

        // Delete collection (products will be unlinked automatically due to cascade)
        await prisma.collection.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        console.error('Error deleting collection:', error);
        return NextResponse.json(
            { error: 'Failed to delete collection' },
            { status: 500 }
        );
    }
}
