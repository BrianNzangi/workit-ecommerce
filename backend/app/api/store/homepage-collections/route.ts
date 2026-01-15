import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const status = searchParams.get('status') || 'active';
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

        // Build where clause
        const where: any = {};

        // Only show enabled collections for storefront
        if (status === 'active') {
            where.enabled = true;
        } else if (status === 'draft') {
            where.enabled = false;
        }

        // Query homepage collections
        const homepageCollections = await prisma.homepageCollection.findMany({
            where,
            take: limit,
            orderBy: {
                sortOrder: 'asc'
            },
            include: {
                products: {
                    orderBy: {
                        sortOrder: 'asc'
                    },
                    include: {
                        product: {
                            include: {
                                variants: {
                                    where: { enabled: true },
                                    select: {
                                        id: true,
                                        name: true,
                                        price: true,
                                        stockOnHand: true,
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
                                },
                                brand: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    }
                                },
                                shippingMethod: {
                                    select: {
                                        id: true,
                                        code: true,
                                        name: true,
                                        description: true,
                                        isExpress: true,
                                    }
                                } as any, // Type assertion for newly added field
                            }
                        }
                    }
                }
            }
        });

        // Transform to expected format
        const formattedCollections = homepageCollections.map(hc => {
            // Transform collection products - filter out disabled products
            const products = (hc as any).products
                .filter((cp: any) => cp.product.enabled)
                .map((cp: any) => {
                    const product = cp.product;

                    // Get price from variants or product-level pricing
                    let price = 0;
                    let compareAtPrice = undefined;

                    if (product.salePrice) {
                        // Use product-level pricing (Sale Price is the current price)
                        price = product.salePrice;
                        compareAtPrice = product.originalPrice || undefined;
                    } else if (product.variants.length > 0) {
                        // Fallback to variant pricing if no product-level price
                        const prices = product.variants.map((v: any) => v.price);
                        price = Math.min(...prices);
                        compareAtPrice = prices.length > 1 ? Math.max(...prices) : undefined;
                    }

                    // Transform assets to images - filter for IMAGE type only
                    const images = product.assets
                        .filter((pa: any) => pa.asset.type === 'IMAGE')
                        .map((pa: any) => ({
                            id: pa.asset.id,
                            url: pa.asset.source,
                            altText: pa.asset.name || product.name,
                        }));

                    return {
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        description: product.description,
                        price,
                        compareAtPrice,
                        condition: product.condition,
                        images,
                        brand: product.brand,
                        shippingMethod: (product as any).shippingMethod || null,
                    };
                });

            return {
                id: hc.id,
                title: hc.title,
                slug: hc.slug,
                position: hc.sortOrder,
                status: hc.enabled ? 'active' : 'draft',
                products,
                createdAt: hc.createdAt.toISOString(),
                updatedAt: hc.updatedAt.toISOString(),
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                homepageCollections: formattedCollections
            }
        });
    } catch (error) {
        console.error('Error fetching homepage collections:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch homepage collections',
                    details: process.env.NODE_ENV === 'development' ? (error as Error).message : {}
                }
            },
            { status: 500 }
        );
    }
}
