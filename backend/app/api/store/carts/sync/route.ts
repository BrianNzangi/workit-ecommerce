import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, items, totalValue, lastUpdated } = body;

        // Validate request
        if (!sessionId || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                },
                { status: 400 }
            );
        }

        // Upsert cart session
        const cart = await prisma.abandonedCart.upsert({
            where: { sessionId },
            update: {
                items,
                totalValue,
                lastUpdated: new Date(lastUpdated),
                isAbandoned: false, // Reset abandoned status on update
                abandonedAt: null,
            },
            create: {
                sessionId,
                items,
                totalValue,
                lastUpdated: new Date(lastUpdated),
                isAbandoned: false,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    cartId: cart.id,
                    sessionId: cart.sessionId,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error syncing cart:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
