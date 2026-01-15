import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

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

        // Delete product variants first (due to foreign key constraint)
        await prisma.productVariant.deleteMany({
            where: { productId: id },
        });

        // Delete product
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting product:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete product' },
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

        const product = await prisma.product.findUnique({
            where: { id },
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
                    orderBy: {
                        sortOrder: 'asc',
                    },
                    include: {
                        asset: true,
                    },
                },
            },
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
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
        const { name, slug, sku, description, enabled, salePrice, originalPrice, stockOnHand, variants = [], collections = [], homepageCollections = [], brandId, shippingMethodId, condition, assetIds = [] } = body;

        // Delete existing variants
        await prisma.productVariant.deleteMany({
            where: { productId: id },
        });

        // Delete existing collection relationships
        await prisma.productCollection.deleteMany({
            where: { productId: id },
        });

        // Delete existing homepage collection relationships
        await prisma.homepageCollectionProduct.deleteMany({
            where: { productId: id },
        });

        // Delete existing product assets
        await prisma.productAsset.deleteMany({
            where: { productId: id },
        });

        // Prepare product data
        const productData: any = {
            name,
            slug,
            sku: sku || null,
            description: description || '',
            salePrice: salePrice ? parseFloat(salePrice) : null,
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        };

        if (enabled !== undefined) {
            productData.enabled = enabled;
        }

        if (brandId !== undefined) {
            productData.brandId = brandId || null;
        }

        if (shippingMethodId !== undefined) {
            productData.shippingMethodId = shippingMethodId || null;
        }

        if (condition !== undefined) {
            productData.condition = condition;
        }

        // Create new variants
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
            productData.variants = {
                create: {
                    name: `${name} - Default`,
                    sku: sku || `${slug}-default`,
                    price: salePrice ? parseFloat(salePrice) : 0,
                    stockOnHand: stockOnHand ? parseInt(stockOnHand) : 0,
                    enabled: enabled !== undefined ? enabled : true,
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

        const product = await prisma.product.update({
            where: { id },
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

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('Error updating product:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (error.code === 'P2002') {
            // Unique constraint violation
            const field = error.meta?.target?.[0] || 'field';
            const message = field === 'sku'
                ? 'Product with this SKU already exists'
                : field === 'slug'
                    ? 'Product with this slug already exists'
                    : 'A product with this information already exists';

            return NextResponse.json(
                { error: message },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to update product' },
            { status: 500 }
        );
    }
}
