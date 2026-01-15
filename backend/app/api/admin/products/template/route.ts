import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // CSV headers
        const headers = [
            'name',
            'slug',
            'sku',
            'description',
            'salePrice',
            'originalPrice',
            'brandId',
            'condition',
            'enabled',
            'collections',
            'imageUrls'
        ];

        // Example row with sample data
        const exampleRow = [
            'Sample Product',
            'sample-product',
            'SKU-001',
            'This is a sample product description',
            '5000.00',
            '6000.00',
            '', // brandId (leave empty or use actual brand ID)
            'NEW', // condition (NEW or REFURBISHED)
            'true',
            '', // collections (comma-separated IDs)
            'https://example.com/image1.jpg,https://example.com/image2.jpg'
        ];

        // Create CSV content
        const csvContent = [
            headers.join(','),
            exampleRow.map(field => `"${field}"`).join(',')
        ].join('\n');

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="product-import-template.csv"',
            },
        });
    } catch (error) {
        console.error('Error generating template:', error);
        return NextResponse.json(
            { error: 'Failed to generate template' },
            { status: 500 }
        );
    }
}
