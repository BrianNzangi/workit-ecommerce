import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderState } from '@prisma/client';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { state } = await request.json();

        if (!state || !Object.values(OrderState).includes(state as OrderState)) {
            return NextResponse.json(
                { success: false, error: 'Invalid order state' },
                { status: 400 }
            );
        }

        console.log(`[Admin Order Status API] Updating order ${id} to state ${state}`);

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { state: state as OrderState },
        });

        return NextResponse.json({
            success: true,
            order: updatedOrder,
        });
    } catch (error: any) {
        console.error('[Admin Order Status API] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to update order status'
            },
            { status: 500 }
        );
    }
}
