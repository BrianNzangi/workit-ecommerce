/**
 * Cart Validation Utility
 * 
 * This utility helps validate cart items and remove invalid ones
 */

export interface CartItem {
    id: string; // This is the Line ID in backend
    productId: string;
    variantId: string | null;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export interface ValidationResult {
    success: boolean;
    data?: {
        valid: boolean;
        validItems: any[];
        invalidItems: any[];
        summary: {
            total: number;
            valid: number;
            invalid: number;
        };
    };
    error?: string;
}

/**
 * Validate cart items against the backend
 */
export async function validateCart(items: CartItem[]): Promise<ValidationResult> {
    try {
        const response = await fetch('/api/cart/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error validating cart:', error);
        return {
            success: false,
            error: 'Failed to validate cart items',
        };
    }
}

/**
 * Remove invalid items from cart
 * Returns the cleaned cart items
 */
export function removeInvalidItems(
    items: CartItem[],
    invalidItems: any[]
): CartItem[] {
    const invalidVariantIds = new Set(
        invalidItems.map(item => item.variantId)
    );

    return items.filter(item => {
        const variantId = item.variantId || item.id;
        return !invalidVariantIds.has(variantId);
    });
}

/**
 * Get detailed error message for invalid items
 */
export function getInvalidItemsMessage(invalidItems: any[]): string {
    if (invalidItems.length === 0) {
        return '';
    }

    const messages = invalidItems.map(item =>
        `• ${item.item?.name || 'Unknown product'}: ${item.reason}`
    );

    return `The following items in your cart are no longer available:\n\n${messages.join('\n')}\n\nPlease remove these items to continue.`;
}

/**
 * Check if a variant ID is a valid UUID
 */
export function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Validate cart items locally (basic check)
 * This doesn't check the database, just validates the structure
 */
export function validateCartItemsLocally(items: CartItem[]): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    items.forEach((item, index) => {
        const variantId = item.variantId || item.id;

        if (!variantId) {
            errors.push(`Item ${index + 1} (${item.name || 'Unknown'}): Missing variant ID`);
        } else if (!isValidUUID(variantId)) {
            errors.push(`Item ${index + 1} (${item.name || 'Unknown'}): Invalid variant ID format (expected UUID, got "${variantId}")`);
        }

        if (!item.name) {
            errors.push(`Item ${index + 1}: Missing product name`);
        }

        if (!item.price || item.price <= 0) {
            errors.push(`Item ${index + 1} (${item.name || 'Unknown'}): Invalid price`);
        }

        if (!item.quantity || item.quantity <= 0) {
            errors.push(`Item ${index + 1} (${item.name || 'Unknown'}): Invalid quantity`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}
