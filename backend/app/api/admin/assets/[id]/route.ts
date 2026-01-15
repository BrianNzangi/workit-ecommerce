import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { AssetService } from '@/lib/services/asset.service';

const assetService = new AssetService(prisma);

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Delete asset
        const success = await assetService.deleteAsset(id);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: 'Failed to delete asset' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Error deleting asset:', error);

        if (error.extensions?.code === 'NOT_FOUND') {
            return NextResponse.json(
                { error: 'Asset not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete asset' },
            { status: 500 }
        );
    }
}

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
        const asset = await assetService.getAsset(id);

        if (!asset) {
            return NextResponse.json(
                { error: 'Asset not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(asset);
    } catch (error) {
        console.error('Error fetching asset:', error);
        return NextResponse.json(
            { error: 'Failed to fetch asset' },
            { status: 500 }
        );
    }
}
