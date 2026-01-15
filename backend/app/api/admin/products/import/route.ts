import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ImageDownloadService } from '@/lib/services/image-download.service';

const imageDownloadService = new ImageDownloadService();

interface ProductRow {
    name: string;
    slug: string;
    sku?: string;
    description?: string;
    salePrice?: number;
    originalPrice?: number;
    brandId?: string;
    condition?: 'NEW' | 'REFURBISHED';
    enabled: boolean;
    collections: string[];
    imageUrls: string[];
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Read CSV content
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return NextResponse.json(
                { error: 'CSV file is empty or invalid' },
                { status: 400 }
            );
        }

        // Parse CSV
        const headers = parseCSVLine(lines[0]);
        const rows: ProductRow[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length !== headers.length) continue;

            const row: any = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index]?.trim() || '';
            });

            // Parse row data
            const condition = row.condition?.toUpperCase();
            rows.push({
                name: row.name,
                slug: row.slug,
                sku: row.sku || undefined,
                description: row.description || undefined,
                salePrice: row.salePrice ? parseFloat(row.salePrice) : undefined,
                originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
                brandId: row.brandId || undefined,
                condition: (condition === 'NEW' || condition === 'REFURBISHED') ? condition : 'NEW',
                enabled: row.enabled?.toLowerCase() !== 'false',
                collections: row.collections ? row.collections.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                imageUrls: row.imageUrls ? row.imageUrls.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            });
        }

        // Fetch all brands for lookup to prevent foreign key errors
        const brands = await prisma.brand.findMany({ select: { id: true, name: true } });
        const brandMap = new Map<string, string>();
        brands.forEach(b => {
            brandMap.set(b.id, b.id);
            brandMap.set(b.name.toLowerCase(), b.id);
        });

        // Fetch default shipping method
        const defaultShippingMethod = await prisma.shippingMethod.findFirst({
            where: {
                OR: [
                    { code: 'standard' },
                    { code: 'standard-shipping' },
                    { enabled: true }
                ]
            },
            orderBy: { createdAt: 'asc' } // Get the oldest/first one
        });

        if (!defaultShippingMethod) {
            return NextResponse.json(
                { error: 'No shipping method found. Please create a shipping method first.' },
                { status: 400 }
            );
        }

        console.log(`Using shipping method: ${defaultShippingMethod.name} (ID: ${defaultShippingMethod.id})`);

        // Import products
        const results = {
            total: rows.length,
            success: 0,
            failed: 0,
            errors: [] as { row: number; error: string }[],
        };

        for (let i = 0; i < rows.length; i++) {
            try {
                const row = rows[i];

                // Validate required fields
                if (!row.name || !row.slug) {
                    throw new Error('Name and slug are required');
                }

                // Resolve Brand ID
                let validBrandId: string | null = null;
                if (row.brandId) {
                    const normalizedBrand = row.brandId.trim();
                    if (brandMap.has(normalizedBrand)) {
                        validBrandId = brandMap.get(normalizedBrand)!;
                    } else if (brandMap.has(normalizedBrand.toLowerCase())) {
                        validBrandId = brandMap.get(normalizedBrand.toLowerCase())!;
                    }
                }

                // Download images if URLs provided
                let assetIds: string[] = [];
                if (row.imageUrls.length > 0) {
                    try {
                        const assets = await imageDownloadService.downloadMultiple(row.imageUrls, 'products');
                        assetIds = assets.map(asset => asset.id);
                    } catch (error) {
                        console.warn(`Failed to download some images for ${row.name}:`, error);
                    }
                }

                // Create product
                const productData: any = {
                    name: row.name,
                    slug: row.slug,
                    sku: row.sku || null,
                    description: row.description || '',
                    salePrice: row.salePrice || null,
                    originalPrice: row.originalPrice || null,
                    condition: row.condition || 'NEW',
                    enabled: row.enabled,
                    brandId: validBrandId, // Use the validated brand ID
                    shippingMethodId: defaultShippingMethod.id, // Use actual shipping method ID
                };

                // Add product assets
                if (assetIds.length > 0) {
                    productData.assets = {
                        create: assetIds.map((assetId, index) => ({
                            assetId,
                            sortOrder: index,
                            featured: index === 0,
                        })),
                    };
                }

                // Add collections
                if (row.collections.length > 0) {
                    productData.collections = {
                        create: row.collections.map((collectionId, index) => ({
                            collectionId,
                            sortOrder: index,
                        })),
                    };
                }

                await prisma.product.upsert({
                    where: { slug: row.slug },
                    update: {
                        name: row.name,
                        sku: row.sku || null,
                        description: row.description || '',
                        salePrice: row.salePrice || null,
                        originalPrice: row.originalPrice || null,
                        condition: (row.condition || 'NEW') as any,
                        enabled: row.enabled,
                        brandId: validBrandId,
                        shippingMethodId: defaultShippingMethod.id, // Use actual shipping method ID
                    },
                    create: productData,
                });

                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    row: i + 2, // +2 because of header and 0-index
                    error: error.message,
                });
            }
        }

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Error importing products:', error);
        return NextResponse.json(
            { error: 'Failed to import products', details: error.message },
            { status: 500 }
        );
    }
}

// Helper function to parse CSV line (handles quoted fields)
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}
