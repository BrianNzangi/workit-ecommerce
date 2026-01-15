import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { validateCart, removeInvalidItems, validateCartItemsLocally, getInvalidItemsMessage } from '@/lib/cart-validation';

export function useCartValidation() {
    const { items, removeItem } = useCartStore();
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [hasInvalidItems, setHasInvalidItems] = useState(false);

    /**
     * Validate cart items against the backend
     */
    const validateCartItems = async () => {
        if (items.length === 0) {
            return { valid: true, invalidItems: [] };
        }

        // First, do a local validation to catch obvious issues
        const localValidation = validateCartItemsLocally(items);
        if (!localValidation.valid) {
            console.warn('Local cart validation failed:', localValidation.errors);
            setValidationError(localValidation.errors.join('\n'));
            setHasInvalidItems(true);
            return { valid: false, invalidItems: [], localErrors: localValidation.errors };
        }

        // Then validate against the backend
        setIsValidating(true);
        setValidationError(null);

        try {
            const result = await validateCart(items);

            if (!result.success) {
                setValidationError(result.error || 'Failed to validate cart');
                setHasInvalidItems(true);
                return { valid: false, invalidItems: [] };
            }

            if (!result.data?.valid) {
                const invalidItems = result.data?.invalidItems || [];
                const errorMessage = getInvalidItemsMessage(invalidItems);
                setValidationError(errorMessage);
                setHasInvalidItems(true);
                return { valid: false, invalidItems };
            }

            setHasInvalidItems(false);
            setValidationError(null);
            return { valid: true, invalidItems: [] };
        } catch (error) {
            console.error('Cart validation error:', error);
            setValidationError('Failed to validate cart items');
            setHasInvalidItems(true);
            return { valid: false, invalidItems: [] };
        } finally {
            setIsValidating(false);
        }
    };

    /**
     * Remove all invalid items from the cart
     */
    const cleanCart = async () => {
        const result = await validateCartItems();

        if (!result.valid && result.invalidItems && result.invalidItems.length > 0) {
            // Remove invalid items
            result.invalidItems.forEach((invalidItem: any) => {
                const variantId = invalidItem.variantId || invalidItem.item?.variantId || invalidItem.item?.id;
                if (variantId) {
                    // Find the cart item with this variant ID and remove it
                    const cartItem = items.find(item =>
                        item.variantId === variantId || item.id === variantId
                    );
                    if (cartItem) {
                        removeItem(cartItem.variantId || cartItem.id);
                    }
                }
            });

            return { cleaned: true, removedCount: result.invalidItems.length };
        }

        return { cleaned: false, removedCount: 0 };
    };

    return {
        validateCartItems,
        cleanCart,
        isValidating,
        validationError,
        hasInvalidItems,
    };
}
