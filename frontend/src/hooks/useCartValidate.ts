'use client';

import { useMutation } from '@tanstack/react-query';
import type { CartItem, ValidationResult } from '@/lib/cart/cart-validation';

async function validateCart(items: CartItem[]): Promise<ValidationResult> {
    const response = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
    });
    return response.json();
}

export function useCartValidate() {
    return useMutation({
        mutationFn: validateCart,
    });
}
