'use client';

import { useMutation } from '@tanstack/react-query';
import { CSRF_HEADER_NAME, ensureCsrfToken } from '@/lib/security/csrf';

interface CouponPayload {
    code: string;
    subtotal: number;
    items: Array<{
        productId: string;
        variantId: string | null;
        price: number;
        quantity: number;
    }>;
}

interface DiscountData {
    success: boolean;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
    value: number;
    discountAmount: number;
    message: string;
}

async function validateCoupon(payload: CouponPayload): Promise<DiscountData> {
    const csrfToken = await ensureCsrfToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (csrfToken) headers[CSRF_HEADER_NAME] = csrfToken;

    const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid coupon code');
    }
    return data;
}

export function useCouponValidate() {
    return useMutation({
        mutationFn: validateCoupon,
    });
}
