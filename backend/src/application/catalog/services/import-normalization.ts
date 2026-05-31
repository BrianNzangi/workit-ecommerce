export interface NormalizedImportRow {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  salePrice?: number | string;
  originalPrice?: number | string;
  stockOnHand?: number | string;
  enabled?: boolean | string;
  condition?: string;
  brandSlug?: string;
  brandId?: string;
  shippingMethodId?: string;
  vat?: number | string;
  vatInclusive?: boolean | string;
  collections?: string | string[];
  assetIds?: string | string[];
  homepageCollections?: string | string[];
}

const canonicalizeImportKey = (key: string): string =>
  String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const readFirstDefined = (row: Record<string, any>, keys: string[]): any => {
  for (const key of keys) {
    const normalized = canonicalizeImportKey(key);
    if (row[normalized] !== undefined) return row[normalized];
  }
  return undefined;
};

export const normalizeImportRow = (row: any): NormalizedImportRow => {
  const normalized: Record<string, any> = {};

  for (const [key, value] of Object.entries(row ?? {})) {
    normalized[canonicalizeImportKey(key)] = value;
  }

  return {
    name: readFirstDefined(normalized, ["name"]),
    slug: readFirstDefined(normalized, ["slug"]),
    sku: readFirstDefined(normalized, ["sku"]),
    description: readFirstDefined(normalized, ["description"]),
    shortDescription: readFirstDefined(normalized, ["shortDescription", "short_description", "short description"]),
    salePrice: readFirstDefined(normalized, ["salePrice", "sale_price", "sale price"]),
    originalPrice: readFirstDefined(normalized, ["originalPrice", "original_price", "original price"]),
    stockOnHand: readFirstDefined(normalized, ["stockOnHand", "stock_on_hand", "stock on hand"]),
    enabled: readFirstDefined(normalized, ["enabled", "isEnabled", "is_enabled"]),
    condition: readFirstDefined(normalized, ["condition"]),
    brandSlug: readFirstDefined(normalized, ["brandSlug", "brand_slug", "brand slug"]),
    brandId: readFirstDefined(normalized, ["brandId", "brand_id", "brand id"]),
    shippingMethodId: readFirstDefined(normalized, ["shippingMethodId", "shipping_method_id", "shipping method id"]),
    vat: readFirstDefined(normalized, ["vat"]),
    vatInclusive: readFirstDefined(normalized, ["vatInclusive", "vat_inclusive", "vat inclusive"]),
    collections: readFirstDefined(normalized, ["collections", "collectionSlugs", "collection_slugs", "collection slugs"]),
    assetIds: readFirstDefined(normalized, ["assetIds", "asset_ids", "asset ids"]),
    homepageCollections: readFirstDefined(normalized, ["homepageCollections", "homepage_collections", "homepage collections"]),
  };
};
