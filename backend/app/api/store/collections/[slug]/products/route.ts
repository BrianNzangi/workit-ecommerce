import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const brandId = searchParams.get('brandId') || '';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            enabled: true, // Only return enabled products for collection page
        };

        // Filter by collection slug
        where.collections = {
            some: {
                collection: {
                    slug: slug
                }
            }
        };

        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Brand filter
        if (brandId) {
            where.brandId = brandId;
        }

        // Execute query with pagination
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder
                },
                include: {
                    variants: {
                        where: { enabled: true },
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                            price: true,
                            stockOnHand: true,
                            option: true,
                            optionValue: true,
                        }
                    },
                    collections: {
                        include: {
                            collection: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                }
                            }
                        }
                    },
                    brand: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            logoUrl: true,
                        }
                    },
                    assets: {
                        orderBy: {
                            sortOrder: 'asc'
                        },
                        include: {
                            asset: {
                                select: {
                                    id: true,
                                    name: true,
                                    source: true,
                                    type: true,
                                }
                            }
                        }
                    }
                }
            }),
            prisma.product.count({ where })
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        // Transform products to match expected format
        const formattedProducts = products.map(product => {
            // Get price from product-level pricing or variants
            let price = 0;
            let compareAtPrice = undefined;

            if (product.salePrice) {
                // Use product-level pricing (Sale Price is the current price)
                price = product.salePrice;
                compareAtPrice = product.originalPrice || undefined;
            } else if (product.variants.length > 0) {
                // Fallback to variant pricing if no product-level price
                const prices = product.variants.map(v => v.price);
                price = Math.min(...prices);
                compareAtPrice = prices.length > 1 ? Math.max(...prices) : undefined;
            }

            // Transform assets to images format
            const images = product.assets
                .filter(pa => pa.asset.type === 'IMAGE')
                .map(pa => ({
                    id: pa.asset.id,
                    url: pa.asset.source,
                    altText: pa.asset.name || product.name,
                    position: pa.sortOrder || 0,
                }));

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                price,
                compareAtPrice,
                sku: product.sku || product.variants[0]?.sku || '',
                trackInventory: true,
                stockQuantity: product.variants.reduce((sum, v) => sum + (v.stockOnHand || 0), 0),
                status: product.enabled ? 'active' : 'draft',
                images,
                collections: product.collections.map(pc => pc.collection),
                brand: product.brand || undefined,
                variants: product.variants,
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                products: formattedProducts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext,
                    hasPrev,
                }
            }
        });
    } catch (error) {
        console.error('Error fetching collection products:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch collection products',
                    details: process.env.NODE_ENV === 'development' ? (error as Error).message : {}
                }
            },
            { status: 500 }
        );
    }
}
