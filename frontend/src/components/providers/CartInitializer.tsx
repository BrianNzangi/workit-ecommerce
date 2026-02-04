'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function CartInitializer() {
    const { fetchCart, sessionId } = useCartStore();
    const initRef = useRef(false);

    useEffect(() => {
        // Prevent double fetch in React Strict Mode if desired, 
        // though executing twice is harmless for idempotency.
        if (!initRef.current) {
            initRef.current = true;
            fetchCart();
        }
    }, [fetchCart]);

    return null;
}
