import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'Product slug is required',
                    }
                },
                { status: 400 }
            );
        }

        // Fetch product by slug
        const product = await prisma.product.findUnique({
            where: {
                slug: slug,
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
                        enabled: true,
                    },
                    orderBy: {
                        createdAt: 'asc' // Default variant first
                    }
                },
                collections: {
                    include: {
                        collection: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                description: true,
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
                        description: true,
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
                } as any,
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
        });

        // Check if product exists
        if (!product) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Product not found',
                    }
                },
                { status: 404 }
            );
        }

        if (!product.enabled) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'PRODUCT_DISABLED',
                        message: 'Product is disabled',
                    }
                },
                { status: 404 }
            );
        }

        // Transform assets to images format
        const images = (product as any).assets
            .filter((pa: any) => pa.asset.type === 'IMAGE')
            .map((pa: any) => ({
                id: pa.asset.id,
                url: pa.asset.source,
                altText: pa.asset.name || product.name,
                position: pa.sortOrder || 0,
            }));

        // Extract product options from variants (if they have option/optionValue)
        const optionsMap = new Map<string, Set<string>>();
        (product as any).variants.forEach((v: any) => {
            if (v.option && v.optionValue) {
                if (!optionsMap.has(v.option)) {
                    optionsMap.set(v.option, new Set());
                }
                optionsMap.get(v.option)!.add(v.optionValue);
            }
        });

        const productOptions = Array.from(optionsMap.entries()).map(([name, values]) => ({
            id: `opt-${name.toLowerCase().replace(/\s+/g, '-')}`,
            name,
            values: Array.from(values)
        }));

        // Format variants (variant-centric: all sellable data lives here)
        const formattedVariants = (product as any).variants.map((v: any) => ({
            id: v.id,
            productId: product.id,
            name: v.option && v.optionValue ? `${v.optionValue}` : 'Default',
            sku: v.sku,
            price: v.price,
            compareAtPrice: product.originalPrice || null, // Can be variant-specific if needed
            inventory: {
                track: true,
                stockOnHand: v.stockOnHand || 0
            },
            options: v.option && v.optionValue ? [
                {
                    name: v.option,
                    value: v.optionValue
                }
            ] : [],
            status: v.enabled ? 'active' : 'inactive'
        }));

        // Format the product response (variant-centric architecture)
        const formattedProduct = {
            product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                status: product.enabled ? 'active' : 'draft',
                condition: (product as any).condition,
                options: productOptions.length > 0 ? productOptions : undefined,
                images,
                collections: (product as any).collections.map((pc: any) => pc.collection),
                brand: (product as any).brand || undefined,
                shippingMethod: (product as any).shippingMethod || null,
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            },
            variants: formattedVariants
        };

        return NextResponse.json({
            success: true,
            data: formattedProduct
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch product',
                    details: process.env.NODE_ENV === 'development' ? (error as Error).message : {}
                }
            },
            { status: 500 }
        );
    }
}
