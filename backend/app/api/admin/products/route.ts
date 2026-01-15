import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, sku, description, enabled = true, salePrice, originalPrice, stockOnHand, variants = [], collections = [], homepageCollections = [], brandId, shippingMethodId, condition = 'NEW', assetIds = [] } = body;

        // Validation
        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Missing required fields: name, slug' },
                { status: 400 }
            );
        }

        // Validate that either default pricing or variants are provided
        if (!salePrice && variants.length === 0) {
            return NextResponse.json(
                { error: 'Either default pricing (salePrice) or variants must be provided' },
                { status: 400 }
            );
        }

        // Get shipping method ID - use provided or fetch default
        let finalShippingMethodId = shippingMethodId;
        if (!finalShippingMethodId) {
            const defaultShippingMethod = await prisma.shippingMethod.findFirst({
                where: {
                    OR: [
                        { code: 'standard' },
                        { code: 'standard-shipping' },
                        { enabled: true }
                    ]
                },
                orderBy: { createdAt: 'asc' }
            });

            if (!defaultShippingMethod) {
                return NextResponse.json(
                    { error: 'No shipping method found. Please create a shipping method first.' },
                    { status: 400 }
                );
            }

            finalShippingMethodId = defaultShippingMethod.id;
        }

        // Create product with variants
        const productData: any = {
            name,
            slug,
            sku: sku || null,
            description: description || '',
            salePrice: salePrice ? parseFloat(salePrice) : null,
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            enabled,
            condition,
            brandId: brandId || null,
            shippingMethodId: finalShippingMethodId, // Use actual shipping method ID
        };

        // If variants are provided, create them
        if (variants.length > 0) {
            productData.variants = {
                create: variants.map((variant: any, index: number) => ({
                    name: variant.optionValue
                        ? `${name} - ${variant.optionValue}`
                        : `${name} - Variant ${index + 1}`,
                    sku: `${slug}-${index + 1}`,
                    price: parseFloat(variant.price),
                    stockOnHand: variant.stockOnHand || 0,
                    enabled: true,
                    option: variant.option || null,
                    optionValue: variant.optionValue || null,
                })),
            };
        } else {
            // Create a default variant with stock
            // This variant will be used for simple products without options
            productData.variants = {
                create: {
                    name: `${name} - Default`,
                    sku: sku || `${slug}-default`,
                    price: salePrice ? parseFloat(salePrice) : 0,
                    stockOnHand: stockOnHand ? parseInt(stockOnHand) : 0,
                    enabled: enabled,
                },
            };
        }
        // If salePrice is provided but no variants, don't create any variants
        // The product will use the product-level pricing

        // Add collections if provided
        if (collections.length > 0) {
            productData.collections = {
                create: collections.map((collectionId: string) => ({
                    collectionId,
                })),
            };
        }

        // Add homepage collections if provided
        if (homepageCollections.length > 0) {
            productData.homepageCollections = {
                create: homepageCollections.map((collectionId: string) => ({
                    collectionId,
                })),
            };
        }

        // Add product assets (images) if provided
        if (assetIds.length > 0) {
            productData.assets = {
                create: assetIds.map((assetId: string, index: number) => ({
                    assetId,
                    sortOrder: index,
                    featured: index === 0, // First image is featured
                })),
            };
        }

        const product = await prisma.product.create({
            data: productData,
            include: {
                variants: true,
                collections: {
                    include: {
                        collection: true,
                    },
                },
                homepageCollections: {
                    include: {
                        collection: true,
                    },
                },
                assets: {
                    include: {
                        asset: true,
                    },
                },
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Product with this slug or SKU already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            include: {
                variants: true,
                collections: {
                    include: {
                        collection: true,
                    },
                },
                homepageCollections: {
                    include: {
                        collection: true,
                    },
                },
                _count: {
                    select: {
                        variants: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
