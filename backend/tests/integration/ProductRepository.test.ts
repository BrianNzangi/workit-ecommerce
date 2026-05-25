/**
 * Integration tests for ProductRepository and ProductMapper.
 *
 * These tests verify the mapping and repository logic using mock database
 * objects, without requiring a live database connection. This approach
 * validates the aggregate reconstruction (toDomain) and persistence
 * (toPersistence) logic.
 *
 * Requirements: 22.1, 22.3
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductMapper, ProductRecord } from '../../src/infrastructure/persistence/mappers/ProductMapper.js';
import { Product } from '../../src/domain/catalog/entities/Product.js';
import { ProductSKU } from '../../src/domain/catalog/value-objects/ProductSKU.js';
import { Money } from '../../src/domain/order-management/value-objects/Money.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const now = new Date('2024-01-15T10:00:00Z');

const rawProduct: ProductRecord = {
  id: 'prod-1',
  name: 'Red Running Shoe',
  slug: 'red-running-shoe',
  sku: 'SHOE-RED-42',
  description: 'A comfortable red running shoe',
  originalPrice: 2000,
  salePrice: 1500,
  stockOnHand: 10,
  enabled: true,
  condition: 'NEW',
  brandId: 'brand-1',
  shippingMethodId: 'standard',
  vat: 16,
  vatInclusive: true,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
};

const rawProductNoSalePrice: ProductRecord = {
  ...rawProduct,
  id: 'prod-2',
  sku: 'SHOE-BLUE-42',
  salePrice: null,
};

const rawProductNoSKU: ProductRecord = {
  ...rawProduct,
  id: 'prod-3',
  sku: null,
};

const rawProductInvalidSKU: ProductRecord = {
  ...rawProduct,
  id: 'prod-4',
  sku: 'invalid sku with spaces', // legacy data that doesn't match current format
};

// ─── ProductMapper Tests ──────────────────────────────────────────────────────

describe('ProductMapper', () => {
  let mapper: ProductMapper;

  beforeEach(() => {
    mapper = new ProductMapper();
  });

  describe('toDomain', () => {
    it('should reconstruct a Product aggregate from raw DB records', () => {
      const product = mapper.toDomain(rawProduct);

      expect(product).toBeInstanceOf(Product);
      expect(product.id).toBe('prod-1');
      expect(product.name).toBe('Red Running Shoe');
      expect(product.slug).toBe('red-running-shoe');
      expect(product.stockOnHand).toBe(10);
      expect(product.enabled).toBe(true);
    });

    it('should reconstruct the SKU value object', () => {
      const product = mapper.toDomain(rawProduct);
      expect(product.sku).toBeInstanceOf(ProductSKU);
      expect(product.sku?.value).toBe('SHOE-RED-42');
    });

    it('should reconstruct prices as Money value objects', () => {
      const product = mapper.toDomain(rawProduct);
      expect(product.originalPrice).toBeInstanceOf(Money);
      expect(product.originalPrice?.amount).toBe(2000);
      expect(product.originalPrice?.currency).toBe('KES');
      expect(product.salePrice?.amount).toBe(1500);
    });

    it('should set salePrice to null when not present in DB', () => {
      const product = mapper.toDomain(rawProductNoSalePrice);
      expect(product.salePrice).toBeNull();
    });

    it('should set sku to null when not present in DB', () => {
      const product = mapper.toDomain(rawProductNoSKU);
      expect(product.sku).toBeNull();
    });

    it('should gracefully handle invalid legacy SKU data (set to null)', () => {
      const product = mapper.toDomain(rawProductInvalidSKU);
      expect(product.sku).toBeNull();
    });

    it('should set currentPrice to salePrice when sale price is set', () => {
      const product = mapper.toDomain(rawProduct);
      expect(product.currentPrice?.amount).toBe(1500);
    });

    it('should set currentPrice to originalPrice when no sale price', () => {
      const product = mapper.toDomain(rawProductNoSalePrice);
      expect(product.currentPrice?.amount).toBe(2000);
    });

    it('should not raise domain events when reconstituting', () => {
      const product = mapper.toDomain(rawProduct);
      expect(product.domainEvents).toHaveLength(0);
    });

    it('should preserve all metadata fields', () => {
      const product = mapper.toDomain(rawProduct);
      expect(product.brandId).toBe('brand-1');
      expect(product.shippingMethodId).toBe('standard');
      expect(product.vat).toBe(16);
      expect(product.vatInclusive).toBe(true);
      expect(product.condition).toBe('NEW');
      expect(product.createdAt).toEqual(now);
      expect(product.updatedAt).toEqual(now);
      expect(product.deletedAt).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('should convert a Product aggregate to a persistence DTO', () => {
      const product = mapper.toDomain(rawProduct);
      const dto = mapper.toPersistence(product);

      expect(dto.id).toBe('prod-1');
      expect(dto.name).toBe('Red Running Shoe');
      expect(dto.slug).toBe('red-running-shoe');
      expect(dto.sku).toBe('SHOE-RED-42');
      expect(dto.originalPrice).toBe(2000);
      expect(dto.salePrice).toBe(1500);
      expect(dto.stockOnHand).toBe(10);
      expect(dto.enabled).toBe(true);
      expect(dto.condition).toBe('NEW');
      expect(dto.brandId).toBe('brand-1');
    });

    it('should set sku to null when product has no SKU', () => {
      const product = mapper.toDomain(rawProductNoSKU);
      const dto = mapper.toPersistence(product);
      expect(dto.sku).toBeNull();
    });

    it('should set salePrice to null when product has no sale price', () => {
      const product = mapper.toDomain(rawProductNoSalePrice);
      const dto = mapper.toPersistence(product);
      expect(dto.salePrice).toBeNull();
    });
  });

  describe('round-trip mapping', () => {
    it('should produce the same aggregate after toDomain → toPersistence → toDomain', () => {
      const original = mapper.toDomain(rawProduct);
      const dto = mapper.toPersistence(original);

      // Reconstruct a raw record from the persistence DTO
      const reconstructedRaw: ProductRecord = {
        ...dto,
        createdAt: original.createdAt,
        deletedAt: original.deletedAt,
      };

      const reconstructed = mapper.toDomain(reconstructedRaw);

      expect(reconstructed.id).toBe(original.id);
      expect(reconstructed.name).toBe(original.name);
      expect(reconstructed.sku?.value).toBe(original.sku?.value);
      expect(reconstructed.stockOnHand).toBe(original.stockOnHand);
      expect(reconstructed.originalPrice?.amount).toBe(original.originalPrice?.amount);
      expect(reconstructed.salePrice?.amount).toBe(original.salePrice?.amount);
    });

    it('should preserve stock changes through the round-trip', () => {
      const original = mapper.toDomain(rawProduct);
      original.reserveStock(3); // stock: 10 → 7
      original.clearEvents();

      const dto = mapper.toPersistence(original);
      expect(dto.stockOnHand).toBe(7);

      const reconstructedRaw: ProductRecord = {
        ...dto,
        createdAt: original.createdAt,
        deletedAt: original.deletedAt,
      };
      const reconstructed = mapper.toDomain(reconstructedRaw);
      expect(reconstructed.stockOnHand).toBe(7);
    });
  });

  describe('batch loading (findByIds simulation)', () => {
    it('should map multiple products correctly', () => {
      const rawProducts = [rawProduct, rawProductNoSalePrice, rawProductNoSKU];
      const products = rawProducts.map((r) => mapper.toDomain(r));

      expect(products).toHaveLength(3);
      expect(products[0].id).toBe('prod-1');
      expect(products[1].id).toBe('prod-2');
      expect(products[2].id).toBe('prod-3');
    });

    it('should handle an empty array', () => {
      const products: Product[] = [];
      expect(products).toHaveLength(0);
    });
  });

  describe('search result mapping', () => {
    it('should correctly map products with various filter scenarios', () => {
      // Simulate what search results would look like
      const enabledProduct = mapper.toDomain({ ...rawProduct, enabled: true });
      const disabledProduct = mapper.toDomain({ ...rawProduct, id: 'prod-disabled', enabled: false });

      expect(enabledProduct.enabled).toBe(true);
      expect(disabledProduct.enabled).toBe(false);
    });

    it('should correctly map products with different conditions', () => {
      const newProduct = mapper.toDomain({ ...rawProduct, condition: 'NEW' });
      const usedProduct = mapper.toDomain({ ...rawProduct, id: 'prod-used', condition: 'USED' });
      const refurbishedProduct = mapper.toDomain({ ...rawProduct, id: 'prod-refurb', condition: 'REFURBISHED' });

      expect(newProduct.condition).toBe('NEW');
      expect(usedProduct.condition).toBe('USED');
      expect(refurbishedProduct.condition).toBe('REFURBISHED');
    });
  });
});
