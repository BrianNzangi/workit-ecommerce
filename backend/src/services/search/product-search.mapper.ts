type ProductAsset = {
    asset?: {
        source?: string | null;
        preview?: string | null;
    } | null;
};

type ProductCollection = {
    collection?: {
        id: string;
        name: string;
        slug: string;
    } | null;
};

type ProductBrand = {
    id: string;
    name: string;
    slug: string;
} | null;

type IndexableProduct = {
    id: string;
    name: string;
    slug: string;
    sku?: string | null;
    description?: string | null;
    enabled: boolean;
    salePrice?: number | null;
    originalPrice?: number | null;
    stockOnHand?: number | null;
    condition?: string | null;
    shippingMethodId?: string | null;
    vat?: number | null;
    vatInclusive?: boolean | null;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
    assets?: ProductAsset[];
    collections?: ProductCollection[];
    brand?: ProductBrand;
};

function getPrimaryImage(product: IndexableProduct): string | null {
    if (!product.assets || product.assets.length === 0) {
        return null;
    }

    for (const item of product.assets) {
        const source = item.asset?.source || item.asset?.preview;
        if (source) {
            return source;
        }
    }

    return null;
}

function toISOString(value?: Date | string | null): string | null {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value.toISOString();
}

export function mapProductToSearchRecord(product: IndexableProduct): Record<string, unknown> {
    const brandName = product.brand?.name || null;
    const collectionNames = (product.collections || [])
        .map((item) => item.collection?.name)
        .filter((name): name is string => Boolean(name));
    const collectionIds = (product.collections || [])
        .map((item) => item.collection?.id)
        .filter((id): id is string => Boolean(id));
    const collectionSlugs = (product.collections || [])
        .map((item) => item.collection?.slug)
        .filter((slug): slug is string => Boolean(slug));

    return {
        objectID: product.id,
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku || null,
        description: product.description || null,
        enabled: product.enabled,
        salePrice: product.salePrice ?? null,
        originalPrice: product.originalPrice ?? null,
        stockOnHand: product.stockOnHand ?? 0,
        inStock: (product.stockOnHand ?? 0) > 0,
        condition: product.condition || null,
        shippingMethodId: product.shippingMethodId || null,
        vat: product.vat ?? null,
        vatInclusive: product.vatInclusive ?? null,
        brandId: product.brand?.id || null,
        brandName,
        brandSlug: product.brand?.slug || null,
        collectionIds,
        collectionNames,
        collectionSlugs,
        image: getPrimaryImage(product),
        createdAt: toISOString(product.createdAt),
        updatedAt: toISOString(product.updatedAt),
        // Additional combined text helps relevance tuning later without schema changes.
        searchableText: [
            product.name,
            product.sku || "",
            product.description || "",
            brandName || "",
            collectionNames.join(" "),
        ].join(" ").trim(),
    };
}
