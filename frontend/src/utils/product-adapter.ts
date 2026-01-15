import { Product } from '../types/product';
import { Variant } from '../types/variant';

/**
 * Normalizes a product item from the API into a simpler format for UI consumption.
 * Assumes a single-product mode where only the first variant is relevant.
 */
export function normalizeSingleProduct(apiItem: { product: any; variants: Variant[] }): Product & { variantId: string; canBuy: boolean; stockOnHand: number } {
    const { product, variants } = apiItem;
    const variant = variants[0];

    if (!variant) {
        // Fallback if no variants exist
        return {
            ...product,
            price: product.salePrice || 0,
            compareAtPrice: product.originalPrice || undefined,
            variantId: '',
            stockOnHand: 0,
            canBuy: false,
        };
    }

    return {
        ...product,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice || undefined,
        stockOnHand: variant.inventory.stockOnHand,
        variantId: variant.id,
        canBuy:
            variant.status === "active" &&
            (!variant.inventory.track || variant.inventory.stockOnHand > 0),
    };
}
