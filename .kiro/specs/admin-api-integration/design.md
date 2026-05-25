# Design Document: Admin API Integration

## Overview

This document describes the technical design for completing the end-to-end wiring between the Admin Panel's GraphQL layer and the backend REST API. The work is purely internal plumbing — no new user-facing features are introduced. Every gap identified in the requirements (broken resolvers, client-side filtering, missing GraphQL surface, missing HttpClient namespaces) is addressed by following the existing architectural pattern:

```
Admin UI → GraphQL Resolver → Service class → HttpClient → Backend REST API
```

All code lives in `admin/src/lib/`. The implementation language is **TypeScript**.

---

## Architecture

### Existing Pattern (unchanged)

```
admin/src/lib/
├── clients/
│   └── http-client.ts          ← typed HTTP client with resource namespaces
├── services/
│   ├── base/base.service.ts    ← BaseService exposes this.adminClient (httpClient)
│   ├── products/product.service.ts
│   ├── orders/order.service.ts
│   └── ...
└── graphql/
    ├── schemas/                ← .graphql SDL files loaded by schema.ts
    ├── resolvers/              ← resolver objects merged in resolvers/index.ts
    │   ├── products/
    │   ├── orders/
    │   └── ...
    ├── errors.ts               ← StructuredError + helper factories
    └── schema.ts               ← loads all .graphql files via readSchema()
```

### Error Mapping Convention

The `HttpClient.request()` already throws a plain object `{ statusCode, message, ...rest }` on non-2xx responses. Services and resolvers must catch these and re-throw using the helpers in `errors.ts`:

| HTTP status | GraphQL error code | Helper |
|---|---|---|
| 400 | `BAD_USER_INPUT` | `validationError()` |
| 401 | `UNAUTHENTICATED` | `unauthorizedError()` |
| 403 | `FORBIDDEN` | `forbiddenError()` |
| 404 | `NOT_FOUND` | `notFoundError()` |
| 5xx | `INTERNAL_ERROR` | `internalError()` |

A shared utility function `mapHttpError(error: any): StructuredError` will be added to `errors.ts` to centralise this mapping and eliminate repetition across services.

---

## Component Design

### 1. HttpClient Extensions (`http-client.ts`)

Three new namespaces and two namespace fixes are required.

#### 1a. New `variants` namespace

```typescript
public get variants() {
    return {
        create: (productId: string, data: any) =>
            this.post<any>(`/catalog/products/admin/${productId}/variants`, data),
        update: (id: string, data: any) =>
            this.put<any>(`/catalog/products/admin/variants/${id}`, data),
        updateStock: (id: string, stockOnHand: number) =>
            this.patch<any>(`/catalog/products/admin/variants/${id}/stock`, { stockOnHand }),
    };
}
```

#### 1b. New `productAssets` namespace

```typescript
public get productAssets() {
    return {
        add: (productId: string, data: any) =>
            this.post<any>(`/catalog/products/admin/${productId}/assets`, data),
        remove: (productId: string, assetId: string) =>
            this.delete<any>(`/catalog/products/admin/${productId}/assets/${assetId}`),
        setFeatured: (productId: string, assetId: string) =>
            this.patch<any>(`/catalog/products/admin/${productId}/assets/${assetId}/featured`, {}),
    };
}
```

#### 1c. `products` namespace — add `inventory` method

```typescript
inventory: (options?: { stockStatus?: string; lowStockThreshold?: number }) =>
    this.get<any>(this.catalogAdminPath("products"), { params: { stockStatus: 'low_stock', ...options } }),
```

#### 1d. `orders.list()` — already accepts `options` and passes them as `params`. The fix is in `OrderService.getOrders()` which currently filters client-side despite the HttpClient already forwarding params correctly. No HttpClient change needed here.

#### 1e. `customers.list()` — already accepts `options` and passes them as `params`. The fix is in `CustomerService.searchCustomers()`. No HttpClient change needed.

#### 1f. `shippingZones` namespace — `list()` already exists in the current code. No change needed.

---

### 2. Shared Error Mapper (`errors.ts`)

Add `mapHttpError` to centralise HTTP-to-GraphQL error translation:

```typescript
export function mapHttpError(error: any): StructuredError {
    const status = error?.statusCode ?? 500;
    const msg = error?.message ?? 'Unknown error';
    if (status === 400) return validationError(msg);
    if (status === 401) return unauthorizedError(msg);
    if (status === 403) return forbiddenError(msg);
    if (status === 404) return notFoundError(msg);
    return internalError(msg);
}
```

---

### 3. Product Variant Mutations (`variant.mutations.ts`)

Replace the three `throw new Error('Not implemented')` stubs:

```typescript
addVariantToProduct: async (_parent, { input }, context) => {
    requireAuth(context.auth);
    try {
        const productService = new ProductService();
        return await productService.addVariant(input.productId, input);
    } catch (e) { throw mapHttpError(e); }
},
updateVariant: async (_parent, { id, input }, context) => {
    requireAuth(context.auth);
    try {
        const productService = new ProductService();
        return await productService.updateVariant(id, input);
    } catch (e) { throw mapHttpError(e); }
},
updateVariantStock: async (_parent, { id, stockOnHand }, context) => {
    requireAuth(context.auth);
    try {
        const productService = new ProductService();
        return await productService.updateVariantStock(id, stockOnHand);
    } catch (e) { throw mapHttpError(e); }
},
```

`ProductService` gains three new methods that delegate to `httpClient.variants.*`.

---

### 4. Product Asset Mutations (`product.mutations.ts`)

Replace the three `throw new Error('Not implemented')` stubs with calls to a new `ProductAssetService` (or methods added to `ProductService`):

```typescript
addAssetToProduct: async (_parent, { productId, assetId, sortOrder, featured }, context) => {
    requireAuth(context.auth);
    try {
        return await productService.addAsset(productId, { assetId, sortOrder, featured });
    } catch (e) { throw mapHttpError(e); }
},
removeAssetFromProduct: async (_parent, { productId, assetId }, context) => {
    requireAuth(context.auth);
    try {
        await httpClient.productAssets.remove(productId, assetId);
        return true;
    } catch (e) { throw mapHttpError(e); }
},
setFeaturedAsset: async (_parent, { productId, assetId }, context) => {
    requireAuth(context.auth);
    try {
        return await httpClient.productAssets.setFeatured(productId, assetId);
    } catch (e) { throw mapHttpError(e); }
},
```

---

### 5. Enhanced Product Search (`product.queries.ts`)

```typescript
searchProductsEnhanced: async (_parent, { searchTerm, options }, context) => {
    requireAuth(context.auth);
    if (!searchTerm) return [];
    try {
        const productService = new ProductService();
        return await productService.searchProductsEnhanced(searchTerm, options);
    } catch (e) { throw mapHttpError(e); }
},
```

`ProductService.searchProductsEnhanced()` calls `httpClient.products.search({ q: searchTerm, ...options })`.

---

### 6. Order Filtering (`order.service.ts`)

Remove client-side filtering. Both `getOrders` and `searchOrders` delegate params directly to the HttpClient:

```typescript
async getOrders(options: OrderListOptions = {}): Promise<Order[]> {
    const response: any = await this.adminClient.orders.list(options);
    return Array.isArray(response) ? response : (response.orders || []);
}

async searchOrders(searchTerm: string): Promise<Order[]> {
    const response: any = await this.adminClient.orders.list({ q: searchTerm });
    return Array.isArray(response) ? response : (response.orders || []);
}
```

---

### 7. Inventory Query (`inventory.queries.ts` + `order.service.ts`)

```typescript
// inventory.queries.ts
inventory: async (_parent, { lowStockThreshold }, context) => {
    requireAuth(context.auth);
    try {
        const orderService = new OrderService();
        return await orderService.getInventory({ lowStockThreshold });
    } catch (e) { throw mapHttpError(e); }
},

// order.service.ts
async getInventory(options: { lowStockThreshold?: number } = {}): Promise<any[]> {
    const response: any = await this.adminClient.products.inventory(options);
    return Array.isArray(response) ? response : (response.products || []);
}
```

---

### 8. Customer Search (`customer.service.ts`)

Remove client-side filtering:

```typescript
async searchCustomers(searchTerm: string, options: CustomerSearchOptions = {}): Promise<Customer[]> {
    const response: any = await this.adminClient.customers.list({ q: searchTerm, ...options });
    return Array.isArray(response) ? response : (response.customers || []);
}
```

---

### 9. Shipping Zone GraphQL Surface

#### 9a. Schema additions (`shipping.graphql`)

```graphql
type ShippingZoneCity {
  id: ID!
  cityTown: String!
  standardPrice: Int!
  expressPrice: Int
}

type ShippingZone {
  id: ID!
  county: String!
  shippingMethodId: String!
  cities: [ShippingZoneCity!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input ShippingZoneCityInput {
  id: ID
  cityTown: String!
  standardPrice: Int!
  expressPrice: Int
}

input CreateShippingZoneInput {
  shippingMethodId: String!
  county: String!
  cities: [ShippingZoneCityInput!]!
}

input UpdateShippingZoneInput {
  shippingMethodId: String
  county: String
  cities: [ShippingZoneCityInput!]
}

extend type Query {
  shippingZones: [ShippingZone!]!
}

extend type Mutation {
  createShippingZone(input: CreateShippingZoneInput!): ShippingZone!
  updateShippingZone(id: ID!, input: UpdateShippingZoneInput!): ShippingZone!
  deleteShippingZone(id: ID!): Boolean!
}
```

#### 9b. New resolver file `shipping.zone.queries.ts`

```typescript
shippingZones: async (_parent, _args, context) => {
    requireAuth(context.auth);
    const settingsService = new AdminSettingsService();
    return await settingsService.getShippingZones();
}
```

`AdminSettingsService.getShippingZones()` calls `this.adminClient.shippingZones.list()`.

#### 9c. New resolver file `shipping.zone.mutations.ts`

Delegates to existing `AdminSettingsService.createShippingZone/updateShippingZone/deleteShippingZone`.

#### 9d. Wire into `resolvers/index.ts`

---

### 10. Banner Delete Mutations

#### 10a. Schema additions (`banner.graphql`)

```graphql
extend type Mutation {
  deleteBanner(id: ID!): Boolean!
  bulkDeleteBanners(ids: [ID!]!): Boolean!
}
```

#### 10b. `BannerService` additions

```typescript
async deleteBanner(id: string): Promise<boolean> {
    await this.adminClient.banners.delete(id);
    return true;
}
async bulkDeleteBanners(ids: string[]): Promise<boolean> {
    await this.adminClient.banners.bulkDelete({ ids });
    return true;
}
```

#### 10c. `banner.mutations.ts` additions

```typescript
deleteBanner: async (_parent, { id }, context) => {
    requireAuth(context.auth);
    try {
        const bannerService = new BannerService();
        return await bannerService.deleteBanner(id);
    } catch (e) { throw mapHttpError(e); }
},
bulkDeleteBanners: async (_parent, { ids }, context) => {
    requireAuth(context.auth);
    try {
        const bannerService = new BannerService();
        return await bannerService.bulkDeleteBanners(ids);
    } catch (e) { throw mapHttpError(e); }
},
```

---

### 11. Campaign GraphQL Surface (new files)

#### 11a. New schema file `campaign.graphql`

```graphql
type Campaign {
  id: ID!
  name: String!
  subject: String
  status: String!
  bannerIds: [String!]!
  collectionIds: [String!]!
  productIds: [String!]!
  emailsSent: Int!
  emailsOpened: Int!
  emailsClicked: Int!
  conversions: Int!
  revenue: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input CreateCampaignInput {
  name: String!
  subject: String
  bannerIds: [String!]
  collectionIds: [String!]
  productIds: [String!]
}

input UpdateCampaignInput {
  name: String
  subject: String
  bannerIds: [String!]
  collectionIds: [String!]
  productIds: [String!]
}

type CampaignDispatchResult {
  campaign: Campaign!
  dispatch: JSON
}

extend type Query {
  campaigns: [Campaign!]!
  campaign(id: ID!): Campaign
}

extend type Mutation {
  createCampaign(input: CreateCampaignInput!): Campaign!
  updateCampaign(id: ID!, input: UpdateCampaignInput!): Campaign!
  deleteCampaign(id: ID!): Boolean!
  sendCampaign(id: ID!): CampaignDispatchResult!
}
```

#### 11b. New resolver files `campaign.queries.ts` and `campaign.mutations.ts`

Both delegate to the existing `CampaignService` (already fully implemented).

#### 11c. Wire into `resolvers/index.ts` and `schema.ts`

---

### 12. Blog Auth Fix (`blog.queries.ts`)

Add `requireAuth(context.auth)` to `blog`, `blogBySlug`, and `blogs` resolvers. Same fix applied to `homepage.queries.ts` (`homepageCollection`, `homepageCollections`) and `collection.queries.ts` (`collection`, `collections`).

---

### 13. Site Settings GraphQL Surface (new files)

#### 13a. New schema file `settings.graphql`

```graphql
scalar JSON

type SiteSettings {
  data: JSON!
}

input SiteSettingsInput {
  data: JSON!
}

extend type Query {
  siteSettings: SiteSettings!
}

extend type Mutation {
  updateSiteSettings(input: SiteSettingsInput!): SiteSettings!
}
```

#### 13b. New resolver files `settings.queries.ts` and `settings.mutations.ts`

Delegate to `AdminSettingsService.getSettings()` and `AdminSettingsService.updateSettings()`.

#### 13c. Wire into `resolvers/index.ts` and `schema.ts`

---

### 14. Analytics Stubs (`analytics.service.ts`)

```typescript
async getLowStockAlerts(threshold?: number): Promise<any[]> {
    const response: any = await this.adminClient.analytics.getWeeklyStats();
    // Backend returns low-stock data inside weekly-stats; extract and filter
    return (response?.lowStockAlerts || []).slice(0, threshold ? undefined : undefined);
}

async getTopSellingProducts(startDate?: Date, endDate?: Date, limit?: number): Promise<any[]> {
    const response: any = await this.adminClient.analytics.getSalesStats();
    const products = response?.topProducts || [];
    return limit ? products.slice(0, limit) : products;
}
```

---

## Data Flow Diagrams

### Variant Mutation Flow

```
GraphQL: addVariantToProduct(input)
  → requireAuth(context.auth)
  → ProductService.addVariant(productId, data)
    → httpClient.variants.create(productId, data)
      → POST /catalog/products/admin/:productId/variants
        ← { id, productId, name, sku, price, stockOnHand, ... }
  ← ProductVariant
```

### Order Filtering Flow (before vs after)

```
BEFORE:
  orders(state: "PENDING")
    → httpClient.orders.list()          ← fetches ALL orders
    → filter in memory by state

AFTER:
  orders(state: "PENDING")
    → httpClient.orders.list({ state: "PENDING" })
      → GET /fulfillment/orders/admin?state=PENDING
        ← [filtered orders from DB]
```

### Error Propagation Flow

```
httpClient.request() → non-2xx response
  → throw { statusCode: 404, message: "Variant not found" }
    → Service catches, calls mapHttpError(e)
      → notFoundError("Variant not found")
        → StructuredError { extensions: { code: "NOT_FOUND" } }
          → GraphQL response: { errors: [{ message: "...", extensions: { code: "NOT_FOUND" } }] }
```

---

## Correctness Properties

These properties are universal invariants that hold across all inputs, not just specific examples.

**Property 1: HTTP 404 always maps to NOT_FOUND**
For any resolver that calls the backend, if the HttpClient throws `{ statusCode: 404 }`, the GraphQL response MUST contain an error with `extensions.code === 'NOT_FOUND'`.
_Validates: Requirements 1.4, 2.4, 6.8, 8.4, 10.3, 14.3_

**Property 2: HTTP status codes map to correct GraphQL error codes**
For any HTTP error status S thrown by the HttpClient:
- S === 400 → `extensions.code === 'VALIDATION_ERROR'`
- S === 401 → `extensions.code === 'UNAUTHORIZED'`
- S === 403 → `extensions.code === 'FORBIDDEN'`
- S >= 500 → `extensions.code === 'INTERNAL_ERROR'`
_Validates: Requirements 14.1, 14.2, 14.4_

**Property 3: All mutations require authentication**
For any Mutation resolver, calling it without a valid auth context MUST throw a `StructuredError` with `extensions.code === 'UNAUTHORIZED'` before any HttpClient call is made.
_Validates: Requirement 13.1, 13.3_

**Property 4: All admin Query resolvers require authentication**
For any Query resolver that accesses admin-only data (all except `_health`), calling it without a valid auth context MUST throw a `StructuredError` with `extensions.code === 'UNAUTHORIZED'`.
_Validates: Requirement 13.2, 13.3_

**Property 5: Order and customer list params are forwarded, not filtered client-side**
For any non-empty filter object passed to `getOrders(options)` or `searchCustomers(term)`, the params MUST appear in the URL query string of the outgoing HTTP request, and no in-memory filtering MUST occur on the response.
_Validates: Requirements 4.1, 4.2, 4.3, 6.1_

**Property 6: Empty search term returns empty array without backend call**
When `searchProductsEnhanced` is called with an empty string `""`, the resolver MUST return `[]` and MUST NOT make any HTTP request.
_Validates: Requirement 3.3_

---

## File Change Summary

| File | Change type |
|---|---|
| `admin/src/lib/clients/http-client.ts` | Add `variants`, `productAssets` namespaces; add `inventory()` to `products` |
| `admin/src/lib/graphql/errors.ts` | Add `mapHttpError()` utility |
| `admin/src/lib/graphql/resolvers/products/variant.mutations.ts` | Implement 3 stubs |
| `admin/src/lib/graphql/resolvers/products/product.mutations.ts` | Implement 3 asset stubs |
| `admin/src/lib/graphql/resolvers/products/product.queries.ts` | Implement `searchProductsEnhanced` |
| `admin/src/lib/services/products/product.service.ts` | Add `addVariant`, `updateVariant`, `updateVariantStock`, `addAsset`, `searchProductsEnhanced` |
| `admin/src/lib/services/orders/order.service.ts` | Remove client-side filtering; implement `getInventory` |
| `admin/src/lib/services/customers/customer.service.ts` | Remove client-side filtering in `searchCustomers` |
| `admin/src/lib/services/settings/admin-settings.service.ts` | Add `getShippingZones()` |
| `admin/src/lib/services/analytics/analytics.service.ts` | Implement `getLowStockAlerts`, `getTopSellingProducts` |
| `admin/src/lib/services/banners/banner.service.ts` | Add `deleteBanner`, `bulkDeleteBanners` |
| `admin/src/lib/graphql/resolvers/orders/inventory.queries.ts` | Implement stub |
| `admin/src/lib/graphql/resolvers/blog/blog.queries.ts` | Add `requireAuth` to all 3 queries |
| `admin/src/lib/graphql/resolvers/homepage/homepage.queries.ts` | Add `requireAuth` to all queries |
| `admin/src/lib/graphql/resolvers/collections/collection.queries.ts` | Add `requireAuth` to all queries |
| `admin/src/lib/graphql/resolvers/banners/banner.mutations.ts` | Add `deleteBanner`, `bulkDeleteBanners` |
| `admin/src/lib/graphql/resolvers/shipping/shipping.queries.ts` | Add `shippingZones` query |
| `admin/src/lib/graphql/resolvers/shipping/shipping.mutations.ts` | Add zone mutations |
| `admin/src/lib/graphql/resolvers/campaigns/campaign.queries.ts` | **New file** |
| `admin/src/lib/graphql/resolvers/campaigns/campaign.mutations.ts` | **New file** |
| `admin/src/lib/graphql/resolvers/settings/settings.queries.ts` | **New file** |
| `admin/src/lib/graphql/resolvers/settings/settings.mutations.ts` | **New file** |
| `admin/src/lib/graphql/resolvers/index.ts` | Wire campaigns and settings resolvers |
| `admin/src/lib/graphql/schemas/shipping.graphql` | Add `ShippingZone` types and operations |
| `admin/src/lib/graphql/schemas/banner.graphql` | Add `deleteBanner`, `bulkDeleteBanners` |
| `admin/src/lib/graphql/schemas/campaign.graphql` | **New file** |
| `admin/src/lib/graphql/schemas/settings.graphql` | **New file** |
| `admin/src/lib/graphql/schema.ts` | Load `campaign.graphql` and `settings.graphql` |
