import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/get-session';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const take = searchParams.get('take') || '50';
    const skip = searchParams.get('skip') || '0';

    const url = `${BACKEND_URL}/assets?take=${take}&skip=${skip}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${session?.session.token}`,
            },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /assets:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'uploads';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Create upload directory in backend if it doesn't exist
        // Files should be stored in backend/uploads so the backend can serve them
        const backendUploadsDir = join(process.cwd(), '..', 'backend', 'uploads', folder);
        if (!existsSync(backendUploadsDir)) {
            await mkdir(backendUploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const filepath = join(backendUploadsDir, filename);

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Create asset record in backend
        const assetData = {
            name: file.name,
            type: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
            mimeType: file.type,
            fileSize: file.size,
            source: `/uploads/${folder}/${filename}`,
            preview: `/uploads/${folder}/${filename}`,
        };

        const backendResponse = await fetch(`${BACKEND_URL}/assets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.session.token}`,
            },
            body: JSON.stringify(assetData),
        });

        if (!backendResponse.ok) {
            return NextResponse.json({ error: 'Failed to create asset record' }, { status: 500 });
        }

        const asset = await backendResponse.json();
        return NextResponse.json(asset, { status: 201 });
    } catch (error) {
        console.error('Error uploading asset:', error);
        return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 });
    }
}
