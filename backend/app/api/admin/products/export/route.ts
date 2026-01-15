import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all products with related data
        const products = await prisma.product.findMany({
            include: {
                brand: true,
                collections: {
                    include: {
                        collection: true,
                    },
                },
                assets: {
                    include: {
                        asset: true,
                    },
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
                variants: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

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

        // Convert products to CSV rows
        const rows = products.map(product => {
            const collections = product.collections.map(pc => pc.collectionId).join(',');
            const imageUrls = product.assets.map(pa => {
                // Convert local paths to full URLs for export
                const source = pa.asset.source;
                if (source.startsWith('/uploads/')) {
                    return `http://localhost:3001${source}`;
                }
                return source;
            }).join(',');

            return [
                product.name,
                product.slug,
                (product as any).sku || '',
                product.description || '',
                (product as any).salePrice?.toString() || '',
                (product as any).originalPrice?.toString() || '',
                (product as any).brandId || '',
                (product as any).condition || 'NEW',
                product.enabled.toString(),
                collections,
                imageUrls
            ];
        });

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        // Return CSV file
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="products-export-${Date.now()}.csv"`,
            },
        });
    } catch (error) {
        console.error('Error exporting products:', error);
        return NextResponse.json(
            { error: 'Failed to export products' },
            { status: 500 }
        );
    }
}
