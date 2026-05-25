import { Product } from '@/types/product';

/**
 * Normalizes a product object from the backend into the format expected by the frontend.
 * This implements "Single Product Mode" logic.
 */
export function normalizeProduct(product: any): Product {
    const stockOnHand = product.stockOnHand ?? 0;
    const inStock = product.inStock ?? stockOnHand > 0;

    // Decide which price to use
    const price = product.salePrice ?? product.price ?? 0;
    const originalPrice = product.originalPrice ?? product.compareAtPrice;

    return {
        ...product,
        // Ensure core fields are present
        id: String(product.id),
        name: product.name,
        slug: product.slug,

        // Normalized Pricing
        price: price,
        salePrice: price,
        compareAtPrice: originalPrice,
        originalPrice: originalPrice,

        // Stock & Buyability
        stockOnHand: stockOnHand,
        inStock: inStock,
        canBuy: inStock,

        // Standardization for Single-Product Mode
        variantId: (product.variants && product.variants.length > 0)
            ? String(product.variants[0].id)
            : String(product.id),

        // Ensure imagery is mapped correctly if missing
        images: product.images || (product.assets?.map((a: any) => ({
            id: a.asset?.id,
            url: a.asset?.url || a.asset?.source || a.asset?.preview,
            altText: a.asset?.altText || product.name,
        })) || []),
        image: product.image || product.featuredImage ||
            (product.images && (product.images[0]?.url || product.images[0]?.preview || product.images[0]?.source)) ||
            (product.assets && (product.assets[0]?.asset?.url || product.assets[0]?.asset?.source || product.assets[0]?.asset?.preview)),
        featuredImage: product.featuredImage || product.image ||
            (product.images && (product.images[0]?.url || product.images[0]?.preview || product.images[0]?.source)) ||
            (product.assets && (product.assets[0]?.asset?.url || product.assets[0]?.asset?.source || product.assets[0]?.asset?.preview)),

        // Ensure variants array exists for components that expect it
        variants: (product.variants && product.variants.length > 0)
            ? product.variants
            : [{
                id: String(product.id),
                name: product.name,
                sku: product.sku || '',
                price: price,
                compareAtPrice: originalPrice,
                status: 'active',
                inventory: {
                    track: true,
                    stockOnHand: stockOnHand,
                }
            }],
    };
}

/**
 * Normalizes a list of products
 */
export function normalizeProducts(products: any[]): Product[] {
    if (!Array.isArray(products)) return [];
    return products.map(normalizeProduct);
}
