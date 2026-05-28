import { Product, ProductCondition } from '../../../domain/catalog/entities/Product.js';
import { ProductSKU } from '../../../domain/catalog/value-objects/ProductSKU.js';
import { Money } from '../../../domain/order-management/value-objects/Money.js';

// ─── Raw DB record types (matching the Drizzle/catalog schema) ───────────────

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  stockOnHand: number;
  enabled: boolean;
  condition: string;
  brandId: string | null;
  shippingMethodId: string | null;
  vat: number;
  vatInclusive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ─── Persistence DTO (what we write back to the DB) ──────────────────────────

export interface ProductPersistenceDto {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  stockOnHand: number;
  enabled: boolean;
  condition: string;
  brandId: string | null;
  shippingMethodId: string | null;
  vat: number;
  vatInclusive: boolean;
  updatedAt: Date;
}

/** Default currency used for product prices (matches existing backend convention). */
const DEFAULT_CURRENCY = 'KES';

/**
 * Maps between the Product aggregate and database records.
 */
export class ProductMapper {
  /**
   * Reconstruct a Product aggregate from a raw database record.
   */
  toDomain(raw: ProductRecord): Product {
    let sku: ProductSKU | null = null;
    if (raw.sku) {
      try {
        sku = ProductSKU.create(raw.sku);
      } catch {
        // If the stored SKU doesn't match the current format rules, treat as null
        // rather than crashing on load. This handles legacy data gracefully.
        sku = null;
      }
    }

    const originalPrice =
      raw.originalPrice !== null && raw.originalPrice !== undefined
        ? Money.create(raw.originalPrice, DEFAULT_CURRENCY)
        : null;

    const salePrice =
      raw.salePrice !== null && raw.salePrice !== undefined
        ? Money.create(raw.salePrice, DEFAULT_CURRENCY)
        : null;

    return Product.reconstitute({
      id: raw.id,
      sku,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      shortDescription: raw.shortDescription ?? null,
      originalPrice,
      salePrice,
      stockOnHand: raw.stockOnHand,
      enabled: raw.enabled,
      condition: (raw.condition as ProductCondition) ?? 'NEW',
      brandId: raw.brandId,
      shippingMethodId: raw.shippingMethodId,
      vat: raw.vat ?? 0,
      vatInclusive: raw.vatInclusive ?? true,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  /**
   * Convert a Product aggregate to a persistence DTO for the products table.
   * Only includes fields that can be updated (excludes id, createdAt).
   */
  toPersistence(product: Product): ProductPersistenceDto {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku?.value ?? null,
      description: product.description,
      shortDescription: product.shortDescription,
      originalPrice: product.originalPrice?.amount ?? null,
      salePrice: product.salePrice?.amount ?? null,
      stockOnHand: product.stockOnHand,
      enabled: product.enabled,
      condition: product.condition,
      brandId: product.brandId,
      shippingMethodId: product.shippingMethodId,
      vat: product.vat,
      vatInclusive: product.vatInclusive,
      updatedAt: product.updatedAt,
    };
  }
}
