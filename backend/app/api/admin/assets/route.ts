import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { AssetService } from '@/lib/services/asset.service';
import { AssetType } from '@prisma/client';

const assetService = new AssetService(prisma);

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'Missing required field: file' },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload asset
        const result = await assetService.uploadAsset({
            file: buffer,
            fileName: file.name,
            mimeType: file.type,
            folder: folder || 'products',
        });

        return NextResponse.json(result.asset, { status: 201 });
    } catch (error: any) {
        console.error('Error uploading asset:', error);

        // Handle validation errors from the service
        if (error.extensions?.code === 'VALIDATION_ERROR') {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to upload asset' },
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
        const type = searchParams.get('type') as AssetType | null;
        const take = searchParams.get('take') ? parseInt(searchParams.get('take')!) : undefined;
        const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined;

        const assets = await assetService.getAssets(
            type || undefined,
            take,
            skip
        );

        return NextResponse.json(assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assets' },
            { status: 500 }
        );
    }
}
