import { headers as nextHeaders } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const canonicalizeImportKey = (key: string) => String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const normalizeImportRow = (row: any) => {
    const normalized: Record<string, any> = {};
    for (const [key, value] of Object.entries(row ?? {})) {
        normalized[canonicalizeImportKey(key)] = value;
    }

    const pick = (...keys: string[]) => {
        for (const key of keys) {
            const normalizedKey = canonicalizeImportKey(key);
            if (normalized[normalizedKey] !== undefined) return normalized[normalizedKey];
        }
        return undefined;
    };

    return {
        name: pick('name'),
        slug: pick('slug'),
        sku: pick('sku'),
        description: pick('description'),
        shortDescription: pick('shortDescription', 'short_description', 'short description'),
        salePrice: pick('salePrice', 'sale_price', 'sale price'),
        originalPrice: pick('originalPrice', 'original_price', 'original price'),
        stockOnHand: pick('stockOnHand', 'stock_on_hand', 'stock on hand'),
        enabled: pick('enabled', 'isEnabled', 'is_enabled'),
        condition: pick('condition'),
        brandSlug: pick('brandSlug', 'brand_slug', 'brand slug'),
        brandId: pick('brandId', 'brand_id', 'brand id'),
        shippingMethodId: pick('shippingMethodId', 'shipping_method_id', 'shipping method id'),
        vat: pick('vat'),
        vatInclusive: pick('vatInclusive', 'vat_inclusive', 'vat inclusive'),
        collections: pick('collections', 'collectionSlugs', 'collection_slugs', 'collection slugs'),
        assetIds: pick('assetIds', 'asset_ids', 'asset ids'),
        homepageCollections: pick('homepageCollections', 'homepage_collections', 'homepage collections'),
    };
};

function getBackendUrl() {
    const env = process.env as Record<string, string | undefined>;
    return (
        env['BACKEND_API_URL'] ||
        env['BACKEND_URL'] ||
        env['NEXT_PUBLIC_BACKEND_URL'] ||
        env['NEXT_PUBLIC_API_URL'] ||
        'http://localhost:3001'
    ).replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
    const headersList = await nextHeaders();
    const cookie = headersList.get('cookie');

    const csrfHeaderName = (
        process.env.NEXT_PUBLIC_CSRF_HEADER_NAME?.trim() ||
        process.env.CSRF_HEADER_NAME?.trim() ||
        'x-xsrf-token'
    ).toLowerCase();
    const csrfToken =
        request.headers.get(csrfHeaderName) ||
        headersList.get(csrfHeaderName) ||
        headersList.get('x-xsrf-token') ||
        headersList.get('x-csrf-token');

    try {
        const body = await request.json();
        const incomingProducts = Array.isArray(body?.products)
            ? body.products
            : Array.isArray(body?.csvData)
                ? body.csvData
                : null;

        if (!Array.isArray(incomingProducts) || incomingProducts.length === 0) {
            return NextResponse.json({ error: 'No products provided' }, { status: 400 });
        }

        const products = incomingProducts.map(normalizeImportRow);

        const backendUrl = getBackendUrl();
        const url = `${backendUrl}/catalog/products/_admin/import`;

        const forwardHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (cookie) forwardHeaders['Cookie'] = cookie;
        if (csrfToken) forwardHeaders[csrfHeaderName] = csrfToken;

        // Send both csvData (old) and products (new) for backward compatibility
        const response = await fetch(url, {
            method: 'POST',
            headers: forwardHeaders,
            body: JSON.stringify({ products, csvData: products }),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying POST /products/import:', error);
        return NextResponse.json({ error: 'Failed to import products' }, { status: 500 });
    }
}
