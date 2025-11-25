// src/hooks/useVendureCart.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { vendureClient } from '@/lib/vendure-client';
import {
    GET_ACTIVE_ORDER,
    ADD_TO_CART,
    ADJUST_ORDER_LINE,
    REMOVE_ORDER_LINE,
} from '@/lib/vendure-queries';

export interface CartItem {
    id: string;
    lineId: string;
    name: string;
    image: string;
    price: number;
    priceWithTax: number;
    quantity: number;
    variantId: string;
}

export interface Cart {
    id?: string;
    code?: string;
    totalQuantity: number;
    subTotal: number;
    total: number;
    items: CartItem[];
}

export function useVendureCart() {
    const [cart, setCart] = useState<Cart>({
        totalQuantity: 0,
        subTotal: 0,
        total: 0,
        items: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch active order
    const fetchCart = useCallback(async () => {
        try {
            const { data } = await vendureClient.query({
                query: GET_ACTIVE_ORDER,
                fetchPolicy: 'network-only',
            }) as { data: any };

            if (data.activeOrder) {
                const order = data.activeOrder;
                setCart({
                    id: order.id,
                    code: order.code,
                    totalQuantity: order.totalQuantity || 0,
                    subTotal: order.subTotalWithTax / 100,
                    total: order.totalWithTax / 100,
                    items: order.lines.map((line: any) => ({
                        id: line.productVariant.product.id,
                        lineId: line.id,
                        name: line.productVariant.product.name,
                        image: line.productVariant.product.featuredAsset?.preview || '',
                        price: line.productVariant.price / 100,
                        priceWithTax: line.productVariant.priceWithTax / 100,
                        quantity: line.quantity,
                        variantId: line.productVariant.id,
                    })),
                });
            } else {
                setCart({
                    totalQuantity: 0,
                    subTotal: 0,
                    total: 0,
                    items: [],
                });
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError('Failed to fetch cart');
        }
    }, []);

    // Add item to cart
    const addItem = async (variantId: string, quantity: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await vendureClient.mutate({
                mutation: ADD_TO_CART,
                variables: {
                    productVariantId: variantId,
                    quantity,
                },
            }) as { data: any };

            if (data.addItemToOrder.__typename === 'Order') {
                await fetchCart();
                return { success: true };
            } else {
                setError(data.addItemToOrder.message || 'Failed to add item');
                return { success: false, error: data.addItemToOrder.message };
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError('Failed to add item to cart');
            return { success: false, error: 'Failed to add item to cart' };
        } finally {
            setLoading(false);
        }
    };

    // Update quantity
    const updateQuantity = async (lineId: string, quantity: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await vendureClient.mutate({
                mutation: ADJUST_ORDER_LINE,
                variables: {
                    orderLineId: lineId,
                    quantity,
                },
            }) as { data: any };

            if (data.adjustOrderLine.__typename === 'Order') {
                await fetchCart();
                return { success: true };
            } else {
                setError(data.adjustOrderLine.message || 'Failed to update quantity');
                return { success: false };
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError('Failed to update quantity');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // Remove item
    const removeItem = async (lineId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await vendureClient.mutate({
                mutation: REMOVE_ORDER_LINE,
                variables: {
                    orderLineId: lineId,
                },
            }) as { data: any };

            if (data.removeOrderLine.__typename === 'Order') {
                await fetchCart();
                return { success: true };
            } else {
                setError(data.removeOrderLine.message || 'Failed to remove item');
                return { success: false };
            }
        } catch (err) {
            console.error('Error removing item:', err);
            setError('Failed to remove item');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // Increase quantity
    const increaseQuantity = async (lineId: string) => {
        const item = cart.items.find(i => i.lineId === lineId);
        if (item) {
            return updateQuantity(lineId, item.quantity + 1);
        }
    };

    // Decrease quantity
    const decreaseQuantity = async (lineId: string) => {
        const item = cart.items.find(i => i.lineId === lineId);
        if (item && item.quantity > 1) {
            return updateQuantity(lineId, item.quantity - 1);
        } else if (item && item.quantity === 1) {
            return removeItem(lineId);
        }
    };

    // Load cart on mount
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return {
        cart,
        loading,
        error,
        addItem,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        refreshCart: fetchCart,
    };
}
