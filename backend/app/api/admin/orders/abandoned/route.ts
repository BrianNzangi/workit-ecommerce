import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sortBy = searchParams.get('sortBy') || 'abandonedAt';
        const order = searchParams.get('order') || 'desc';

        const skip = (page - 1) * limit;

        const [carts, total] = await Promise.all([
            prisma.abandonedCart.findMany({
                where: {
                    isAbandoned: true,
                    isConverted: false,
                },
                orderBy: {
                    [sortBy]: order,
                },
                skip,
                take: limit,
            }),
            prisma.abandonedCart.count({
                where: {
                    isAbandoned: true,
                    isConverted: false,
                },
            }),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: {
                    carts: carts.map((cart) => ({
                        id: cart.id,
                        sessionId: cart.sessionId,
                        items: cart.items,
                        totalValue: cart.totalValue,
                        lastUpdated: cart.lastUpdated,
                        abandonedAt: cart.abandonedAt,
                        itemCount: Array.isArray(cart.items)
                            ? (cart.items as any[]).reduce(
                                (sum: number, item: any) => sum + (item.quantity || 0),
                                0
                            )
                            : 0,
                    })),
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching abandoned carts:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
