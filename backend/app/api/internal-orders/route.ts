import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    console.log('[Admin Orders API] GET request received');
    try {
        // Fetch orders directly from database
        console.log('[Admin Orders API] Querying database...');
        const orders = await prisma.order.findMany({
            take: 100,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        console.log(`[Admin Orders API] Successfully fetched ${orders.length} orders`);

        return NextResponse.json({
            success: true,
            orders: orders.map((order: any) => ({
                id: order.id,
                code: order.code,
                state: order.state,
                total: order.total,
                createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
                customer: order.customer,
            })),
        });
    } catch (error: any) {
        console.error('[Admin Orders API] Detailed error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch orders',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
