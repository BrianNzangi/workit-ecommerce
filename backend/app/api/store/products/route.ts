import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 4.5 Pagination (mandatory)
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Query Parameters
        const search = searchParams.get('search') || '';
        const collectionSlug = searchParams.get('collection');
        const sort = searchParams.get('sort');
        const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
        const inStock = searchParams.get('inStock') === 'true';

        // Build where clause
        const where: any = {
            enabled: true, // Default to active products
        };

        // 4.1 Collection Filter
        if (collectionSlug) {
            where.collections = {
                some: {
                    collection: {
                        slug: collectionSlug
                    }
                }
            };
        } else if (searchParams.get('collectionId')) {
            // Backward compatibility for collectionId
            where.collections = {
                some: {
                    collectionId: searchParams.get('collectionId')!
                }
            };
        }

        // Brand Filter
        const brandId = searchParams.get('brandId');
        if (brandId) {
            where.brandId = brandId;
        }

        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // 4.3 Price Filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceFilter: any = {};
            if (minPrice !== undefined) priceFilter.gte = minPrice;
            if (maxPrice !== undefined) priceFilter.lte = maxPrice;

            where.OR = [
                { salePrice: priceFilter },
                {
                    variants: {
                        some: {
                            price: priceFilter
                        }
                    }
                }
            ];
        }

        // 4.4 Availability Filter
        if (inStock) {
            where.variants = {
                some: {
                    stockOnHand: { gt: 0 }
                }
            };
        }

        // 4.2 Sorting
        let orderBy: any = { createdAt: 'desc' }; // Default to newest

        if (sort) {
            switch (sort) {
                case 'price_asc':
                    orderBy = { salePrice: 'asc' };
                    break;
                case 'price_desc':
                    orderBy = { salePrice: 'desc' };
                    break;
                case 'newest':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'oldest':
                    orderBy = { createdAt: 'asc' };
                    break;
                case 'popular':
                    // Note: salesCount is not currently on the Product model. 
                    // Fallback to createdAt desc for now or we could add salesCount to schema.
                    orderBy = { createdAt: 'desc' };
                    break;
            }
        } else {
            // Legacy support for sortBy/sortOrder if needed, or just default
            const sortBy = searchParams.get('sortBy');
            const sortOrder = searchParams.get('sortOrder');
            if (sortBy) {
                orderBy = { [sortBy]: sortOrder || 'desc' };
            }
        }

        // Execute query with pagination
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
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
                    shippingMethod: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            description: true,
                            isExpress: true,
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

        // Transform products to match variant-centric format
        const formattedProducts = products.map(product => {
            // Transform assets to images format
            const images = product.assets
                .filter(pa => pa.asset.type === 'IMAGE')
                .map(pa => ({
                    id: pa.asset.id,
                    url: pa.asset.source,
                    altText: pa.asset.name || product.name,
                    position: pa.sortOrder || 0,
                }));

            // Extract product options from variants
            const optionsMap = new Map<string, Set<string>>();
            product.variants.forEach((v: any) => {
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
            const formattedVariants = product.variants.map((v: any) => ({
                id: v.id,
                productId: product.id,
                name: v.option && v.optionValue ? `${v.optionValue}` : 'Default',
                sku: v.sku,
                price: v.price,
                compareAtPrice: product.originalPrice || null,
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

            return {
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    status: product.enabled ? 'active' : 'draft',
                    condition: product.condition,
                    options: productOptions.length > 0 ? productOptions : undefined,
                    images,
                    collections: product.collections.map((pc: any) => pc.collection),
                    brand: product.brand || undefined,
                    shippingMethod: product.shippingMethod || null,
                    createdAt: product.createdAt.toISOString(),
                    updatedAt: product.updatedAt.toISOString(),
                },
                variants: formattedVariants
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
        console.error('Error fetching products:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch products',
                    details: process.env.NODE_ENV === 'development' ? (error as Error).message : {}
                }
            },
            { status: 500 }
        );
    }
}
