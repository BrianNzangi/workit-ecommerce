import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API endpoint to sync cart data to backend for abandoned cart tracking
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, items, lastUpdated } = body;

        if (!sessionId || !items || !Array.isArray(items)) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data' },
                { status: 400 }
            );
        }

        // Calculate total value
        const totalValue = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Send cart data to backend for abandoned cart tracking
        const response = await fetch(`${BACKEND_URL}/api/store/carts/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId,
                items: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    quantity: item.quantity,
                })),
                totalValue,
                lastUpdated,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend cart sync failed:', errorText);
            return NextResponse.json(
                { success: false, error: 'Failed to sync cart to backend' },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error syncing cart:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
