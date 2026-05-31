import { describe, expect, it } from 'vitest';
import { normalizeImportRow } from '../../../../src/application/catalog/services/import-normalization.js';

describe('normalizeImportRow', () => {
  it('normalizes legacy CSV header variants into canonical import fields', () => {
    const row = normalizeImportRow({
      name: '  SAM L RAM DDR4 4GB 3200 ',
      slug: ' sam-l-ram-ddr4-4gb-3200 ',
      'sale Price': '4000',
      'original price': '5000',
      'stock on hand': '20',
      enabled: 'TRUE',
      brandId: 'brand-slug',
      'shippingMethodid': 'standard',
      'vat inclusive': 'yes',
      'short description': 'Fast memory',
    });

    expect(row.name).toBe('  SAM L RAM DDR4 4GB 3200 ');
    expect(row.slug).toBe(' sam-l-ram-ddr4-4gb-3200 ');
    expect(row.salePrice).toBe('4000');
    expect(row.originalPrice).toBe('5000');
    expect(row.stockOnHand).toBe('20');
    expect(row.enabled).toBe('TRUE');
    expect(row.brandId).toBe('brand-slug');
    expect(row.shippingMethodId).toBe('standard');
    expect(row.vatInclusive).toBe('yes');
    expect(row.shortDescription).toBe('Fast memory');
  });

  it('preserves collection-style array values', () => {
    const row = normalizeImportRow({
      collections: ['gaming', 'laptops'],
      homepage_collections: ['featured'],
    });

    expect(row.collections).toEqual(['gaming', 'laptops']);
    expect(row.homepageCollections).toEqual(['featured']);
  });
});
