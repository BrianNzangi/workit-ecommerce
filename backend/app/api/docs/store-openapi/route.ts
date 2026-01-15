import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
    try {
        const filePath = join(process.cwd(), '.gemini', 'store-openapi.yaml');
        const fileContent = await readFile(filePath, 'utf-8');

        return new NextResponse(fileContent, {
            headers: {
                'Content-Type': 'application/x-yaml',
            },
        });
    } catch (error) {
        console.error('Error reading OpenAPI spec:', error);
        return NextResponse.json(
            { error: 'Failed to load OpenAPI specification' },
            { status: 500 }
        );
    }
}
