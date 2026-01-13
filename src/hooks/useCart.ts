/**
 * Cart Hook
 * 
 * Provides cart functionality by reading from the Zustand cart store
 * and transforming the data to match the expected interface
 */

import { useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';

export interface CartItem {
    id: string;
    lineId: string; // For cart line items
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    priceWithTax: number; // Price including tax
    quantity: number;
    image?: string;
}

export interface Cart {
    items: CartItem[];
    total: number;
    subTotal: number; // Match component expectation
    subtotal: number; // Also keep this for consistency
    tax: number;
    shipping: number;
}

export function useCart() {
    const {
        items: storeItems,
        addItem: addToStore,
        removeItem: removeFromStore,
        increaseQuantity: increaseInStore,
        decreaseQuantity: decreaseInStore,
        clearCart: clearStore,
        getTotalQuantity,
    } = useCartStore();

    // Transform cart store items to match the expected CartItem interface
    const cart = useMemo<Cart>(() => {
        const transformedItems: CartItem[] = storeItems.map(item => ({
            id: item.id,
            lineId: item.id, // Use same ID for line items
            productId: item.id,
            variantId: undefined, // Cart store doesn't track variant IDs yet
            name: item.name,
            price: item.price,
            priceWithTax: item.price, // For now, price includes tax
            quantity: item.quantity,
            image: item.image,
        }));

        const subtotal = transformedItems.reduce((sum, item) =>
            sum + (item.price * item.quantity), 0
        );

        const tax = 0; // Tax is included in price
        const shipping = 0; // Will be calculated during checkout

        return {
            items: transformedItems,
            total: subtotal + tax + shipping,
            subTotal: subtotal,
            subtotal: subtotal,
            tax,
            shipping,
        };
    }, [storeItems]);

    const addItem = async (productId: string, variantId?: string, quantity: number = 1) => {
        // This function signature is for compatibility
        // The actual addItem in the store takes a full product object
        // This would need to be called from components that have the full product data
        console.warn('useCart.addItem: Use useCartStore.addItem directly with full product data');
    };

    const removeItem = async (itemId: string) => {
        removeFromStore(itemId);
    };

    const increaseQuantity = async (itemId: string) => {
        increaseInStore(itemId);
    };

    const decreaseQuantity = async (itemId: string) => {
        decreaseInStore(itemId);
    };

    const clearCart = async () => {
        clearStore();
    };

    return {
        cart,
        loading: false, // Cart operations are synchronous with Zustand
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
    };
}
