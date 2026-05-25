import type { Product, ProductPromotion } from '@/types/product';

function formatKesAmount(value: number): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    });
}

export function getProductPromotionBadge(product: Pick<Product, 'activePromotion'>): string | null {
    return product.activePromotion?.badgeText?.trim() || null;
}

export function getProductPriceDisplay(product: Pick<Product, 'price' | 'compareAtPrice' | 'activePromotion'>) {
    const basePrice = Number(product.price || 0);
    const compareAtPrice = typeof product.compareAtPrice === 'number'
        ? Number(product.compareAtPrice)
        : null;
    const promotion = product.activePromotion || null;
    const promotionalPrice = typeof promotion?.promotionalPrice === 'number'
        ? Number(promotion.promotionalPrice)
        : null;

    const displayPrice = promotionalPrice !== null && promotionalPrice < basePrice
        ? promotionalPrice
        : basePrice;

    const regularPrice = (() => {
        if (displayPrice < basePrice && compareAtPrice && compareAtPrice > basePrice) {
            return compareAtPrice;
        }

        if (displayPrice < basePrice) {
            return basePrice;
        }

        return compareAtPrice && compareAtPrice > displayPrice ? compareAtPrice : null;
    })();

    const savingsAmount = regularPrice && regularPrice > displayPrice
        ? regularPrice - displayPrice
        : 0;
    const savingsPercent = savingsAmount > 0 && regularPrice
        ? Math.round((savingsAmount / regularPrice) * 100)
        : null;

    let savingsLabel: string | null = null;
    if (promotion && (promotion.savingsAmount || 0) > 0) {
        if (promotion.discountType === 'FIXED_AMOUNT') {
            savingsLabel = `KES ${formatKesAmount(Number(promotion.savingsAmount || 0))} OFF`;
        } else if (promotion.savingsPercent) {
            savingsLabel = `${promotion.savingsPercent}% OFF`;
        }
    } else if (savingsPercent) {
        savingsLabel = `${savingsPercent}% OFF`;
    }

    return {
        displayPrice,
        regularPrice,
        savingsLabel,
    };
}

export function getPromotionAriaText(promotion: ProductPromotion | null | undefined): string | null {
    if (!promotion?.badgeText) {
        return null;
    }

    return `Promotion available: ${promotion.badgeText}`;
}
