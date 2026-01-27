import { NextRequest, NextResponse } from 'next/server';

// Type definition for a Coupon (matching the database schema)
interface MockCoupon {
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrderValue: number;
    enabled: boolean;
    startDate: Date;
    endDate: Date | null;
    usageLimit: number | null;
    usedCount: number;
}

// Mock Database for Coupons
// In a production environment with direct DB access, replace this with Drizzle calls.
const MOCK_COUPONS: Record<string, MockCoupon> = {
    'BACKTOSCHOOL25': {
        code: 'BACKTOSCHOOL25',
        type: 'FIXED', // 200 KES off as requested
        value: 200,
        minOrderValue: 5000,
        enabled: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 100,
        usedCount: 0,
    },
    'SAVE10': {
        code: 'SAVE10',
        type: 'PERCENTAGE', // 10% off
        value: 10,
        minOrderValue: 0,
        enabled: true,
        startDate: new Date('2024-01-01'),
        endDate: null,
        usageLimit: null,
        usedCount: 0,
    }
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, subtotal } = body;

        if (!code) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
        }

        const normalizedCode = code.toUpperCase();

        // --- DB LOOKUP SIMULATION ---
        // Replace this line with a database call: const coupon = await db.query.coupons.findFirst(...)
        const coupon = MOCK_COUPONS[normalizedCode];

        // 1. Check if exists and is enabled
        if (!coupon || !coupon.enabled) {
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
        }

        // 2. Check Validity Period
        const now = new Date();
        if (now < coupon.startDate) {
            return NextResponse.json({ error: 'Coupon is not yet active' }, { status: 400 });
        }
        if (coupon.endDate && now > coupon.endDate) {
            return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
        }

        // 3. Check Usage Limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
        }

        // 4. Check Minimum Order Value
        if (subtotal < coupon.minOrderValue) {
            return NextResponse.json({
                error: `Minimum order value of KES ${coupon.minOrderValue.toLocaleString()} required`
            }, { status: 400 });
        }

        // 5. Calculate Discount
        let discountAmount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discountAmount = (subtotal * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }

        // Cap discount at subtotal (cannot have negative total)
        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }

        return NextResponse.json({
            success: true,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discountAmount,
            message: 'Coupon applied successfully!'
        });
    } catch (error) {
        console.error('Coupon API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
