import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Validate cart items endpoint
 * POST /api/store/cart/validate
 * 
 * Checks if all variant IDs in the cart exist in the database
 * and returns detailed information about invalid items
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid request: items array is required'
            }, { status: 400 });
        }

        const validationResults = [];
        const invalidItems = [];

        for (const item of items) {
            const variantId = item.variantId;

            if (!variantId || variantId === item.id) {
                invalidItems.push({
                    item,
                    reason: !variantId ? 'No variant ID provided' : 'Invalid variant ID: cannot match product ID'
                });
                continue;
            }

            // Check if variant exists
            const variant = await prisma.productVariant.findUnique({
                where: { id: String(variantId) },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            enabled: true
                        }
                    }
                }
            });

            if (!variant) {
                invalidItems.push({
                    item,
                    variantId,
                    reason: `Variant with ID "${variantId}" not found in database`
                });
            } else if (!variant.enabled) {
                invalidItems.push({
                    item,
                    variantId,
                    reason: 'Variant is disabled'
                });
            } else if (!variant.product.enabled) {
                invalidItems.push({
                    item,
                    variantId,
                    reason: 'Product is disabled'
                });
            } else if (variant.stockOnHand < (item.quantity || 1)) {
                invalidItems.push({
                    item,
                    variantId,
                    reason: `Insufficient stock. Available: ${variant.stockOnHand}, Requested: ${item.quantity || 1}`
                });
            } else {
                validationResults.push({
                    variantId,
                    valid: true,
                    variant: {
                        id: variant.id,
                        name: variant.name,
                        sku: variant.sku,
                        price: variant.price,
                        stockOnHand: variant.stockOnHand
                    },
                    product: variant.product
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                valid: invalidItems.length === 0,
                validItems: validationResults,
                invalidItems,
                summary: {
                    total: items.length,
                    valid: validationResults.length,
                    invalid: invalidItems.length
                }
            }
        });

    } catch (error) {
        console.error('Error validating cart:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to validate cart items'
        }, { status: 500 });
    }
}
