# Catalog Bounded Context

## Overview

The Catalog context manages the product catalog, including product information, inventory levels, brands, collections, and search functionality. It's an upstream context that provides product data to other contexts.

## Purpose

- Maintain product catalog with pricing and metadata
- Manage product inventory and stock levels
- Organize products into brands and collections
- Provide product search and filtering capabilities
- Track stock changes and notify other contexts

## Key Concepts

### Aggregates

#### Product Aggregate
The central aggregate representing a product in the catalog.

**Root Entity**: Product
**Value Objects**: ProductSKU, Money

**Key Methods**:
- `create()` - Create a new product
- `reserveStock(quantity)` - Reserve inventory for an order
- `releaseStock(quantity)` - Release reserved inventory
- `getCurrentPrice()` - Get current price (sale or original)

### Value Objects

- **ProductSKU**: Stock Keeping Unit - unique product identifier
- **Money**: Price with currency support

### Domain Services

#### StockAllocationService
Manages atomic stock reservation across multiple products.

**Methods**:
- `allocateStock(products, requests)` - Reserve stock for multiple products atomically

### Domain Events

- **ProductStockChanged**: Published when stock is reserved or released
- **ProductCreated**: Published when a new product is added
- **ProductUpdated**: Published when product details change

## Bounded Context Relationships

### Depends On
- None (upstream context)

### Publishes Events To
- **Order Management Context**: ProductStockChanged (for stock validation)

### Subscribes To Events From
- None

## Directory Structure

```
catalog/
├── entities/
│   ├── Product.ts        # Product aggregate root
│   ├── Brand.ts          # Brand entity
│   └── Collection.ts     # Collection entity
├── value-objects/
│   ├── ProductSKU.ts     # Product identifier
│   └── Money.ts          # Price value object
├── services/
│   └── StockAllocationService.ts # Stock management
├── repositories/
│   └── IProductRepository.ts # Product repository interface
├── events/
│   ├── ProductStockChanged.ts # Stock change event
│   ├── ProductCreated.ts # Product creation event
│   └── ProductUpdated.ts # Product update event
└── errors/
    ├── InsufficientStockError.ts
    └── InvalidSKUError.ts
```

## Key Business Rules

### Product Management
1. Each product must have a unique SKU
2. Products can be enabled or disabled
3. Products can have a sale price or original price only
4. Sale price (if present) must be <= original price

### Stock Management
1. Stock level must never be negative
2. Stock is reserved atomically for orders
3. Reserved stock is released if order is cancelled
4. Stock changes trigger ProductStockChanged events

### Pricing
1. Original price is always required
2. Sale price is optional and temporary
3. Current price is sale price if available, otherwise original price
4. Prices are in cents (no floating-point)

## Integration Points

### With Order Management Context
- **Asynchronous**: Publish ProductStockChanged events when stock changes
- **Synchronous**: Order Management queries product data during order creation

### With Marketing Context
- **Synchronous**: Marketing queries product data for campaign eligibility

## Testing Strategy

### Unit Tests
- Product creation and validation
- Stock reservation and release
- Price calculations (sale vs original)
- SKU uniqueness validation
- Invariant enforcement (non-negative stock, price validity)

### Integration Tests
- Stock allocation across multiple products
- Event publishing on stock changes
- Product search with filters
- Concurrent stock updates

### Example Test Cases
```typescript
// Stock management
test('Stock is reserved correctly', () => {
  const product = Product.create({...});
  product.reserveStock(5);
  expect(product.stockOnHand).toBe(15); // 20 - 5
});

// Price validation
test('Sale price cannot exceed original price', () => {
  expect(() => {
    Product.create({
      originalPrice: Money.create(1000),
      salePrice: Money.create(1500)
    });
  }).toThrow();
});

// Stock events
test('ProductStockChanged event is published', () => {
  const product = Product.create({...});
  product.reserveStock(5);
  expect(product.domainEvents).toContainEqual(
    expect.objectContaining({
      eventType: 'ProductStockChanged'
    })
  );
});
```

## Performance Considerations

### Optimization Strategies
1. **Caching**: Cache product data with TTL (5-10 minutes)
2. **Indexing**: Index by enabled status, brand, and creation date
3. **Search**: Use full-text search for product name/description
4. **Batch Loading**: Load multiple products by IDs in single query

### Query Patterns
- Find product by ID (frequently cached)
- Find product by SKU (unique lookup)
- Search products with filters (paginated)
- Find products by IDs (batch operation)

### Cache Invalidation
- Invalidate product cache on stock changes
- Invalidate search cache on product updates
- Use TTL-based expiration for automatic cleanup

## Future Enhancements

1. **Product Variants**: Support product variants (size, color, etc.)
2. **Bulk Operations**: Bulk import/export of products
3. **Product Reviews**: Integrate customer reviews
4. **Recommendations**: Product recommendation engine
5. **Inventory Alerts**: Low stock notifications
6. **Product Bundles**: Bundle multiple products together
7. **Seasonal Products**: Manage seasonal availability

## Related Documentation

- [Context Map](../../../docs/CONTEXT_MAP.md) - Relationships with other contexts
- [Aggregate Diagrams](../../../docs/AGGREGATES.md) - Product aggregate structure
- [Domain Glossary](../../../docs/GLOSSARY.md) - Domain terminology
