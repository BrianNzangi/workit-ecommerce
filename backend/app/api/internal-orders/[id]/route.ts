import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    console.log(`[Admin Order Details API] GET request received for order ${id}`);

    try {
        // Fetch order with all relations
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                lines: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                            }
                        }
                    }
                },
                shippingAddress: true,
                billingAddress: true,
                payments: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
            },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            order: {
                ...order,
                subTotal: order.subTotal,
                shipping: order.shipping,
                tax: order.tax,
                total: order.total,
                createdAt: order.createdAt.toISOString(),
                updatedAt: order.updatedAt.toISOString(),
                lines: order.lines.map(line => ({
                    ...line,
                    linePrice: line.linePrice,
                }))
            },
        });
    } catch (error: any) {
        console.error('[Admin Order Details API] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch order details'
            },
            { status: 500 }
        );
    }
}
