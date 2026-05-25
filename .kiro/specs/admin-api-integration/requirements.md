# Requirements Document

## Introduction

The Workit admin panel (Next.js, port 3002) communicates with the backend exclusively through a GraphQL Yoga server hosted at `/api/graphql`. GraphQL resolvers delegate to service classes, which call an `HttpClient` that proxies requests to the backend REST API (Fastify, port 3001).

The backend was recently migrated from `backend-old` to a new DDD-structured `backend`. The new backend is a superset of the old one — it exposes all the same admin REST endpoints under prefixes like `/catalog/*/admin`, `/fulfillment/*/admin`, `/identity/*/admin`, `/marketing/*/admin`, `/analytics/*`, and `/site/settings/admin`.

Currently, several GraphQL resolvers throw `"Not implemented"` errors, some service methods contain client-side workarounds (e.g., filtering orders in memory instead of using backend query params), and a few operations (product variants, product asset management, inventory) have no backend wiring at all. The goal of this feature is to ensure every admin operation is properly connected end-to-end: Admin UI → GraphQL resolver → Service → `HttpClient` → Backend REST API.

## Glossary

- **Admin_Panel**: The Next.js application at port 3002 that provides the merchant management interface.
- **GraphQL_Server**: The GraphQL Yoga server running inside the Admin_Panel at `/api/graphql`.
- **Resolver**: A GraphQL resolver function that handles a specific Query or Mutation.
- **Service**: A TypeScript class in `admin/src/lib/services/` that encapsulates business logic and delegates to the `HttpClient`.
- **HttpClient**: The typed HTTP client in `admin/src/lib/clients/http-client.ts` that maps resource namespaces to backend REST endpoints.
- **Backend**: The Fastify REST API at port 3001 with DDD architecture.
- **Admin_Endpoint**: A backend REST route protected by `fastify.authenticate` and `fastify.authorizePermission`, accessible under paths like `/catalog/products/admin`.
- **Product**: A catalog item with name, slug, description, price, stock, variants, assets, and collection assignments.
- **Variant**: A purchasable SKU of a Product with its own price, stock, and option values.
- **Collection**: A grouping of Products used for navigation and display.
- **Brand**: A manufacturer or label associated with Products.
- **Asset**: A media file (image, video, document) stored in MinIO and referenced by Products, Collections, Banners, etc.
- **Order**: A customer purchase record with line items, shipping address, payment, and a lifecycle state.
- **Customer**: A registered storefront user with addresses and order history.
- **ShippingMethod**: A named delivery option with a price, used during checkout.
- **ShippingZone**: A geographic zone (county/city) linked to a ShippingMethod with per-city pricing.
- **Banner**: A promotional image displayed on the storefront at a specific position.
- **Campaign**: A marketing email campaign linked to banners, collections, and featured products.
- **Blog**: A published article with title, slug, content, and optional cover asset.
- **HomepageCollection**: A curated set of Products displayed on the storefront homepage.
- **Analytics**: Aggregated sales and order metrics served by the backend analytics module.
- **Settings**: Key-value store for site-wide configuration managed via `/site/settings/admin`.

---

## Requirements

### Requirement 1: Product Variant Management

**User Story:** As an admin, I want to create, update, and adjust stock for product variants, so that I can manage purchasable SKUs for each product.

#### Acceptance Criteria

1. WHEN an admin submits a `addVariantToProduct` mutation with a valid `CreateVariantInput`, THE GraphQL_Server SHALL call `POST /catalog/products/admin/:productId/variants` on the Backend and return the created `ProductVariant`.
2. WHEN an admin submits an `updateVariant` mutation with a valid variant ID and `UpdateVariantInput`, THE GraphQL_Server SHALL call `PUT /catalog/products/admin/variants/:id` on the Backend and return the updated `ProductVariant`.
3. WHEN an admin submits an `updateVariantStock` mutation with a variant ID and a non-negative integer `stockOnHand`, THE GraphQL_Server SHALL call `PATCH /catalog/products/admin/variants/:id/stock` on the Backend and return the updated `ProductVariant`.
4. IF the Backend returns a 404 for any variant operation, THEN THE GraphQL_Server SHALL return a GraphQL error with code `NOT_FOUND`.
5. THE HttpClient SHALL expose a `variants` namespace with `create`, `update`, and `updateStock` methods mapped to the corresponding Backend Admin_Endpoints.

### Requirement 2: Product Asset Management

**User Story:** As an admin, I want to attach, remove, and feature assets on products, so that product images are correctly associated and displayed.

#### Acceptance Criteria

1. WHEN an admin submits an `addAssetToProduct` mutation with a `productId`, `assetId`, optional `sortOrder`, and optional `featured` flag, THE GraphQL_Server SHALL call `POST /catalog/products/admin/:productId/assets` on the Backend and return the created `ProductAsset`.
2. WHEN an admin submits a `removeAssetFromProduct` mutation with a `productId` and `assetId`, THE GraphQL_Server SHALL call `DELETE /catalog/products/admin/:productId/assets/:assetId` on the Backend and return `true` on success.
3. WHEN an admin submits a `setFeaturedAsset` mutation with a `productId` and `assetId`, THE GraphQL_Server SHALL call `PATCH /catalog/products/admin/:productId/assets/:assetId/featured` on the Backend and return the updated `ProductAsset`.
4. IF the Backend returns a 404 for any asset operation, THEN THE GraphQL_Server SHALL return a GraphQL error with code `NOT_FOUND`.

### Requirement 3: Enhanced Product Search

**User Story:** As an admin, I want to search products with advanced filtering options, so that I can quickly find specific SKUs or variants.

#### Acceptance Criteria

1. WHEN an admin submits a `searchProductsEnhanced` query with a `searchTerm` and optional `SearchProductsOptions`, THE GraphQL_Server SHALL call `GET /catalog/products/admin/search?q=<searchTerm>` on the Backend and return a list of `SearchResult` objects.
2. THE `searchProductsEnhanced` resolver SHALL require authentication via `requireAuth`.
3. WHEN the `searchTerm` is an empty string, THE GraphQL_Server SHALL return an empty list without calling the Backend.

### Requirement 4: Order Filtering and Search

**User Story:** As an admin, I want to filter orders by state and search by customer name or order code, so that I can efficiently manage the order queue.

#### Acceptance Criteria

1. WHEN an admin queries `orders` with an `OrderListOptions` containing a `state` filter, THE GraphQL_Server SHALL pass the `state` parameter as a query string to `GET /fulfillment/orders/admin` on the Backend instead of filtering results client-side.
2. WHEN an admin queries `searchOrders` with a `searchTerm`, THE GraphQL_Server SHALL call `GET /fulfillment/orders/admin?q=<searchTerm>` on the Backend and return matching orders.
3. THE `orders` resolver SHALL support `take`, `skip`, `sortBy`, `sortOrder`, and `state` query parameters forwarded to the Backend.
4. IF the Backend returns an empty list, THEN THE GraphQL_Server SHALL return an empty array without error.

### Requirement 5: Inventory Query

**User Story:** As an admin, I want to view inventory items with low stock alerts, so that I can restock products before they run out.

#### Acceptance Criteria

1. WHEN an admin queries `inventory` with an optional `lowStockThreshold`, THE GraphQL_Server SHALL call `GET /catalog/products/admin?stockStatus=low_stock` (or equivalent) on the Backend and return a list of `InventoryItem` objects.
2. WHEN `lowStockThreshold` is provided, THE GraphQL_Server SHALL pass it as a query parameter to the Backend endpoint.
3. THE `inventory` resolver SHALL require authentication via `requireAuth`.
4. IF the Backend returns a 200 with an empty list, THEN THE GraphQL_Server SHALL return an empty array.

### Requirement 6: Customer Management

**User Story:** As an admin, I want to list, search, create, update, and manage customer addresses, so that I can support customers and maintain accurate records.

#### Acceptance Criteria

1. WHEN an admin queries `searchCustomers` with a `searchTerm`, THE GraphQL_Server SHALL call `GET /identity/customers/admin?q=<searchTerm>` on the Backend and return matching `Customer` objects.
2. WHEN an admin submits a `registerCustomer` mutation, THE GraphQL_Server SHALL call `POST /identity/customers/admin` on the Backend and return the created `Customer`.
3. WHEN an admin submits an `updateCustomer` mutation, THE GraphQL_Server SHALL call `PUT /identity/customers/admin/:id` on the Backend and return the updated `Customer`.
4. WHEN an admin queries `customerOrders` with a `customerId`, THE GraphQL_Server SHALL call `GET /identity/customers/admin/:customerId/orders` on the Backend and return a list of `Order` objects.
5. WHEN an admin submits a `createAddress` mutation, THE GraphQL_Server SHALL call `POST /identity/customers/admin/:customerId/addresses` on the Backend and return the created `Address`.
6. WHEN an admin submits an `updateAddress` mutation, THE GraphQL_Server SHALL call `PUT /identity/customers/admin/addresses/:id` on the Backend and return the updated `Address`.
7. WHEN an admin submits a `deleteAddress` mutation, THE GraphQL_Server SHALL call `DELETE /identity/customers/admin/addresses/:id` on the Backend and return `true` on success.
8. IF the Backend returns a 404 for any customer or address operation, THEN THE GraphQL_Server SHALL return a GraphQL error with code `NOT_FOUND`.

### Requirement 7: Shipping Zone Management

**User Story:** As an admin, I want to create, update, and delete shipping zones, so that I can configure per-county and per-city delivery pricing.

#### Acceptance Criteria

1. WHEN an admin submits a `createShippingZone` mutation with a valid `ShippingZoneInput`, THE GraphQL_Server SHALL call `POST /fulfillment/shipping/admin/zones` on the Backend and return the created zone.
2. WHEN an admin submits an `updateShippingZone` mutation, THE GraphQL_Server SHALL call `PATCH /fulfillment/shipping/admin/zones/:id` on the Backend and return the updated zone.
3. WHEN an admin submits a `deleteShippingZone` mutation, THE GraphQL_Server SHALL call `DELETE /fulfillment/shipping/admin/zones/:id` on the Backend and return `true` on success.
4. WHEN an admin queries `shippingZones`, THE GraphQL_Server SHALL call `GET /fulfillment/shipping/admin/zones` on the Backend and return a list of zone objects.
5. THE GraphQL schema SHALL define `ShippingZone`, `CreateShippingZoneInput`, and `UpdateShippingZoneInput` types to support these operations.

### Requirement 8: Banner Management

**User Story:** As an admin, I want to delete banners and bulk-delete multiple banners, so that I can keep the storefront promotions current.

#### Acceptance Criteria

1. WHEN an admin submits a `deleteBanner` mutation with a banner ID, THE GraphQL_Server SHALL call `DELETE /marketing/banners/admin/:id` on the Backend and return `true` on success.
2. WHEN an admin submits a `bulkDeleteBanners` mutation with a list of IDs, THE GraphQL_Server SHALL call `POST /marketing/banners/admin/bulk-delete` on the Backend and return `true` on success.
3. THE GraphQL schema SHALL expose `deleteBanner(id: ID!): Boolean!` and `bulkDeleteBanners(ids: [ID!]!): Boolean!` mutations.
4. IF the Backend returns a 404 for a `deleteBanner` call, THEN THE GraphQL_Server SHALL return a GraphQL error with code `NOT_FOUND`.

### Requirement 9: Campaign Management

**User Story:** As an admin, I want to manage marketing campaigns end-to-end including sending them, so that I can run email promotions to customers.

#### Acceptance Criteria

1. WHEN an admin queries `campaigns`, THE GraphQL_Server SHALL call `GET /marketing/campaigns/admin` on the Backend and return a list of `Campaign` objects.
2. WHEN an admin queries `campaign` with an ID, THE GraphQL_Server SHALL call `GET /marketing/campaigns/admin/:id` on the Backend and return the `Campaign`.
3. WHEN an admin submits a `createCampaign` mutation, THE GraphQL_Server SHALL call `POST /marketing/campaigns/admin` on the Backend and return the created `Campaign`.
4. WHEN an admin submits an `updateCampaign` mutation, THE GraphQL_Server SHALL call `PUT /marketing/campaigns/admin/:id` on the Backend and return the updated `Campaign`.
5. WHEN an admin submits a `deleteCampaign` mutation, THE GraphQL_Server SHALL call `DELETE /marketing/campaigns/admin/:id` on the Backend and return `true` on success.
6. WHEN an admin submits a `sendCampaign` mutation with a campaign ID, THE GraphQL_Server SHALL call `POST /marketing/campaigns/admin/:id/send` on the Backend and return the dispatch result.
7. THE GraphQL schema SHALL define `Campaign`, `CreateCampaignInput`, `UpdateCampaignInput`, and related types.
8. THE GraphQL schema SHALL expose `campaigns`, `campaign`, `createCampaign`, `updateCampaign`, `deleteCampaign`, and `sendCampaign` operations.

### Requirement 10: Blog Publish Toggle

**User Story:** As an admin, I want to publish and unpublish blog posts, so that I can control which articles are visible on the storefront.

#### Acceptance Criteria

1. WHEN an admin submits a `publishBlog` mutation with a blog ID, THE GraphQL_Server SHALL call `PATCH /marketing/blog/admin/:id/toggle-publish` on the Backend with `{ published: true }` and return the updated `Blog`.
2. WHEN an admin submits an `unpublishBlog` mutation with a blog ID, THE GraphQL_Server SHALL call `PATCH /marketing/blog/admin/:id/toggle-publish` on the Backend with `{ published: false }` and return the updated `Blog`.
3. IF the Backend returns a 404, THEN THE GraphQL_Server SHALL return a GraphQL error with code `NOT_FOUND`.

### Requirement 11: Site Settings Management

**User Story:** As an admin, I want to read and update site-wide settings, so that I can configure the storefront behaviour without a code deployment.

#### Acceptance Criteria

1. WHEN an admin queries `siteSettings`, THE GraphQL_Server SHALL call `GET /site/settings/admin` on the Backend and return the settings object.
2. WHEN an admin submits an `updateSiteSettings` mutation with a key-value map, THE GraphQL_Server SHALL call `POST /site/settings/admin` on the Backend with the provided data and return the updated settings.
3. THE GraphQL schema SHALL define `SiteSettings` and `SiteSettingsInput` types and expose `siteSettings` and `updateSiteSettings` operations.
4. THE `siteSettings` and `updateSiteSettings` operations SHALL require authentication via `requireAuth`.

### Requirement 12: Analytics Queries

**User Story:** As an admin, I want to view dashboard statistics, recent orders, low-stock alerts, and top-selling products, so that I can monitor business performance.

#### Acceptance Criteria

1. WHEN an admin queries `getDashboardStats` with `startDate` and `endDate`, THE GraphQL_Server SHALL call `GET /analytics/dashboard-overview` on the Backend and return a `DashboardStats` object.
2. WHEN an admin queries `getRecentOrders` with an optional `limit`, THE GraphQL_Server SHALL call `GET /analytics/recent-orders` on the Backend and return a list of `RecentOrder` objects.
3. WHEN an admin queries `getLowStockAlerts` with an optional `threshold`, THE GraphQL_Server SHALL call `GET /analytics/weekly-stats` or an equivalent Backend endpoint and return a list of `LowStockAlert` objects.
4. WHEN an admin queries `getTopSellingProducts` with `startDate`, `endDate`, and optional `limit`, THE GraphQL_Server SHALL call `GET /analytics/sales-stats` on the Backend and return a list of `TopSellingProduct` objects.
5. ALL analytics resolvers SHALL require authentication via `requireAuth`.

### Requirement 13: Authentication Consistency

**User Story:** As a system, I want all admin-only GraphQL operations to enforce authentication, so that unauthenticated requests are rejected before reaching the backend.

#### Acceptance Criteria

1. THE GraphQL_Server SHALL call `requireAuth(context.auth)` at the start of every Mutation resolver.
2. THE GraphQL_Server SHALL call `requireAuth(context.auth)` at the start of every Query resolver that accesses admin-only data.
3. IF `requireAuth` throws, THEN THE GraphQL_Server SHALL return a GraphQL error with code `UNAUTHENTICATED` before any Backend call is made.
4. THE `blog`, `blogs`, `blogBySlug`, `collections`, `collection`, `homepageCollections`, and `homepageCollection` queries SHALL require authentication, as they are admin-panel operations.

### Requirement 14: Error Propagation

**User Story:** As an admin, I want meaningful error messages when backend operations fail, so that I can understand what went wrong and take corrective action.

#### Acceptance Criteria

1. WHEN the Backend returns a 400 status, THE GraphQL_Server SHALL return a GraphQL error with code `BAD_USER_INPUT` and include the backend error message.
2. WHEN the Backend returns a 401 or 403 status, THE GraphQL_Server SHALL return a GraphQL error with code `UNAUTHENTICATED` or `FORBIDDEN` respectively.
3. WHEN the Backend returns a 404 status, THE GraphQL_Server SHALL return a GraphQL error with code `NOT_FOUND`.
4. WHEN the Backend returns a 5xx status, THE GraphQL_Server SHALL return a GraphQL error with code `INTERNAL_ERROR`.
5. THE HttpClient SHALL throw structured error objects containing `statusCode` and `message` fields so that Service classes and Resolvers can map them to appropriate GraphQL errors.

### Requirement 15: HttpClient Completeness

**User Story:** As a developer, I want the HttpClient to have a complete mapping of all backend admin endpoints, so that services can call any backend operation without writing raw fetch calls.

#### Acceptance Criteria

1. THE HttpClient SHALL expose a `variants` namespace with methods: `create(productId, data)`, `update(id, data)`, `updateStock(id, stockOnHand)`.
2. THE HttpClient SHALL expose a `productAssets` namespace with methods: `add(productId, data)`, `remove(productId, assetId)`, `setFeatured(productId, assetId)`.
3. THE HttpClient SHALL expose a `shippingZones` namespace with methods: `list(options?)`, `create(data)`, `update(id, data)`, `delete(id)` — the `list` method is currently missing and SHALL be added.
4. THE HttpClient SHALL expose a `campaigns` namespace with all existing methods plus `bulkDelete(data)` already present.
5. THE HttpClient `orders` namespace SHALL pass filter parameters (`state`, `q`, `take`, `skip`, `sortBy`, `sortOrder`) as query string parameters to the Backend.
6. THE HttpClient `customers` namespace SHALL pass a `q` search parameter to `GET /identity/customers/admin` when searching.
