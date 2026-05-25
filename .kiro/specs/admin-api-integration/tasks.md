# Implementation Plan: Admin API Integration

## Overview

Wire every broken or missing admin operation end-to-end: HttpClient → Service → GraphQL Resolver → Schema. The work follows the existing pattern throughout and introduces no new architectural concepts. All changes are in `admin/src/lib/`.

## Tasks

- [-] 1. Add `mapHttpError` utility and extend HttpClient with missing namespaces
  - [x] 1.1 Add `mapHttpError(error)` to `admin/src/lib/graphql/errors.ts`
    - Map `statusCode` 400 → `validationError`, 401 → `unauthorizedError`, 403 → `forbiddenError`, 404 → `notFoundError`, 5xx → `internalError`
    - Export the function so services and resolvers can import it
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  - [x] 1.2 Add `variants` namespace to `HttpClient` in `http-client.ts`
    - `create(productId, data)` → `POST /catalog/products/admin/:productId/variants`
    - `update(id, data)` → `PUT /catalog/products/admin/variants/:id`
    - `updateStock(id, stockOnHand)` → `PATCH /catalog/products/admin/variants/:id/stock`
    - _Requirements: 1.5, 15.1_
  - [x] 1.3 Add `productAssets` namespace to `HttpClient` in `http-client.ts`
    - `add(productId, data)` → `POST /catalog/products/admin/:productId/assets`
    - `remove(productId, assetId)` → `DELETE /catalog/products/admin/:productId/assets/:assetId`
    - `setFeatured(productId, assetId)` → `PATCH /catalog/products/admin/:productId/assets/:assetId/featured`
    - _Requirements: 15.2_
  - [x] 1.4 Add `inventory(options?)` method to the `products` namespace in `HttpClient`
    - Calls `GET /catalog/products/admin` with `params: { stockStatus: 'low_stock', ...options }`
    - _Requirements: 5.1, 5.2, 15.1_
  - [ ] 1.5 Write unit tests for `mapHttpError`
    - Test each status code boundary (400, 401, 403, 404, 500, 503)
    - Test unknown status codes default to `INTERNAL_ERROR`
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 2. Implement product variant mutations
  - [x] 2.1 Add `addVariant`, `updateVariant`, `updateVariantStock` methods to `ProductService`
    - `addVariant(productId, data)` → `this.adminClient.variants.create(productId, data)`
    - `updateVariant(id, data)` → `this.adminClient.variants.update(id, data)`
    - `updateVariantStock(id, stockOnHand)` → `this.adminClient.variants.updateStock(id, stockOnHand)`
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 2.2 Implement the three stubs in `variant.mutations.ts`
    - Replace `throw new Error('Not implemented')` with calls to `ProductService` methods
    - Wrap each call in try/catch using `mapHttpError`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.3 Write property test for HTTP 404 → NOT_FOUND mapping in variant mutations
    - **Property 1: HTTP 404 always maps to NOT_FOUND**
    - **Validates: Requirements 1.4, 14.3**

- [x] 3. Implement product asset mutations
  - [x] 3.1 Add `addAsset`, `removeAsset`, `setFeaturedAsset` methods to `ProductService`
    - Delegate to `this.adminClient.productAssets.*`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 3.2 Implement the three asset stubs in `product.mutations.ts`
    - Replace `throw new Error('Not implemented')` with calls to `ProductService` methods
    - Wrap each call in try/catch using `mapHttpError`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 3.3 Write unit tests for asset mutations
    - Test `addAssetToProduct` returns `ProductAsset`
    - Test `removeAssetFromProduct` returns `true`
    - Test `setFeaturedAsset` returns updated `ProductAsset`
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Implement `searchProductsEnhanced` and fix product query auth
  - [x] 4.1 Add `searchProductsEnhanced(searchTerm, options?)` to `ProductService`
    - Calls `this.adminClient.products.search({ q: searchTerm, ...options })`
    - Returns `SearchResult[]`
    - _Requirements: 3.1_
  - [x] 4.2 Implement `searchProductsEnhanced` resolver in `product.queries.ts`
    - Add `requireAuth(context.auth)` call
    - Return `[]` immediately when `searchTerm` is empty without calling backend
    - Wrap in try/catch using `mapHttpError`
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 4.3 Write property test for empty search term short-circuit
    - **Property 6: Empty search term returns empty array without backend call**
    - **Validates: Requirements 3.3**

- [-] 5. Fix order filtering and implement inventory query
  - [x] 5.1 Remove client-side filtering from `OrderService.getOrders()` and `OrderService.searchOrders()`
    - `getOrders(options)` passes `options` directly to `this.adminClient.orders.list(options)`
    - `searchOrders(term)` calls `this.adminClient.orders.list({ q: term })`
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 5.2 Implement `OrderService.getInventory(options)` to call `this.adminClient.products.inventory(options)`
    - Return `response.products || []`
    - _Requirements: 5.1, 5.2_
  - [x] 5.3 Implement the `inventory` resolver stub in `inventory.queries.ts`
    - Add `requireAuth(context.auth)`
    - Delegate to `OrderService.getInventory({ lowStockThreshold })`
    - Wrap in try/catch using `mapHttpError`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ] 5.4 Write property test for order params forwarding
    - **Property 5: Order and customer list params are forwarded, not filtered client-side**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 6. Fix customer search client-side filtering
  - [x] 6.1 Rewrite `CustomerService.searchCustomers()` to pass `q` to `this.adminClient.customers.list({ q: searchTerm, ...options })`
    - Remove the local `.filter()` call
    - _Requirements: 6.1, 15.6_
  - [x] 6.2 Write unit test for customer search delegation
    - Verify `customers.list` is called with `{ q: searchTerm }` and no local filtering occurs
    - _Requirements: 6.1_

- [ ] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Add shipping zone GraphQL surface
  - [ ] 8.1 Extend `shipping.graphql` with `ShippingZone`, `ShippingZoneCity`, `CreateShippingZoneInput`, `UpdateShippingZoneInput` types
    - Add `shippingZones: [ShippingZone!]!` to `extend type Query`
    - Add `createShippingZone`, `updateShippingZone`, `deleteShippingZone` to `extend type Mutation`
    - _Requirements: 7.4, 7.5_
  - [ ] 8.2 Add `getShippingZones()` to `AdminSettingsService`
    - Calls `this.adminClient.shippingZones.list()`
    - _Requirements: 7.4_
  - [ ] 8.3 Add `shippingZones` query to `shipping.queries.ts`
    - `requireAuth(context.auth)`, delegate to `AdminSettingsService.getShippingZones()`
    - _Requirements: 7.4_
  - [ ] 8.4 Add `createShippingZone`, `updateShippingZone`, `deleteShippingZone` mutations to `shipping.mutations.ts`
    - Delegate to existing `AdminSettingsService` methods
    - Wrap in try/catch using `mapHttpError`
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 8.5 Write unit tests for shipping zone resolvers
    - Test `shippingZones` returns list from service
    - Test `deleteShippingZone` returns `true`
    - _Requirements: 7.3, 7.4_

- [ ] 9. Add banner delete mutations
  - [ ] 9.1 Add `deleteBanner(id)` and `bulkDeleteBanners(ids)` to `BannerService`
    - `deleteBanner` → `this.adminClient.banners.delete(id)`, return `true`
    - `bulkDeleteBanners` → `this.adminClient.banners.bulkDelete({ ids })`, return `true`
    - _Requirements: 8.1, 8.2_
  - [ ] 9.2 Extend `banner.graphql` with `deleteBanner(id: ID!): Boolean!` and `bulkDeleteBanners(ids: [ID!]!): Boolean!` mutations
    - _Requirements: 8.3_
  - [ ] 9.3 Add `deleteBanner` and `bulkDeleteBanners` resolvers to `banner.mutations.ts`
    - `requireAuth`, delegate to `BannerService`, wrap in try/catch using `mapHttpError`
    - _Requirements: 8.1, 8.2, 8.4_
  - [ ]* 9.4 Write property test for 404 → NOT_FOUND in deleteBanner
    - **Property 1: HTTP 404 always maps to NOT_FOUND**
    - **Validates: Requirements 8.4, 14.3**

- [ ] 10. Create campaign GraphQL surface
  - [ ] 10.1 Create `admin/src/lib/graphql/schemas/campaign.graphql`
    - Define `Campaign`, `CreateCampaignInput`, `UpdateCampaignInput`, `CampaignDispatchResult` types
    - Expose `campaigns`, `campaign` queries and `createCampaign`, `updateCampaign`, `deleteCampaign`, `sendCampaign` mutations
    - _Requirements: 9.7, 9.8_
  - [ ] 10.2 Create `admin/src/lib/graphql/resolvers/campaigns/campaign.queries.ts`
    - `campaigns` → `CampaignService.getCampaigns()`
    - `campaign(id)` → `CampaignService.getCampaign(id)`
    - Both require `requireAuth`
    - _Requirements: 9.1, 9.2_
  - [ ] 10.3 Create `admin/src/lib/graphql/resolvers/campaigns/campaign.mutations.ts`
    - `createCampaign` → `CampaignService.createCampaign(input)`
    - `updateCampaign` → `CampaignService.updateCampaign(id, input)`
    - `deleteCampaign` → `CampaignService.deleteCampaign(id)`
    - `sendCampaign` → `CampaignService.sendCampaign(id)`
    - All require `requireAuth`
    - _Requirements: 9.3, 9.4, 9.5, 9.6_
  - [ ] 10.4 Load `campaign.graphql` in `schema.ts` and wire campaign resolvers into `resolvers/index.ts`
    - _Requirements: 9.7, 9.8_
  - [ ]* 10.5 Write unit tests for campaign resolvers
    - Test `campaigns` returns list
    - Test `sendCampaign` returns `CampaignDispatchResult`
    - _Requirements: 9.1, 9.6_

- [ ] 11. Fix blog, homepage, and collection query authentication
  - [ ] 11.1 Add `requireAuth(context.auth)` to `blog`, `blogBySlug`, and `blogs` resolvers in `blog.queries.ts`
    - _Requirements: 13.4_
  - [ ] 11.2 Add `requireAuth(context.auth)` to `homepageCollection` and `homepageCollections` resolvers in `homepage.queries.ts`
    - _Requirements: 13.4_
  - [ ] 11.3 Add `requireAuth(context.auth)` to `collection` and `collections` resolvers in `collection.queries.ts`
    - _Requirements: 13.4_
  - [ ]* 11.4 Write unit tests verifying unauthenticated calls to these resolvers throw UNAUTHORIZED
    - Test one resolver from each file (blog, homepage, collection)
    - _Requirements: 13.2, 13.3_

- [ ] 12. Create site settings GraphQL surface
  - [ ] 12.1 Create `admin/src/lib/graphql/schemas/settings.graphql`
    - Define `SiteSettings` type (wrapping a `JSON` scalar) and `SiteSettingsInput`
    - Expose `siteSettings: SiteSettings!` query and `updateSiteSettings(input: SiteSettingsInput!): SiteSettings!` mutation
    - _Requirements: 11.3_
  - [ ] 12.2 Create `admin/src/lib/graphql/resolvers/settings/settings.queries.ts`
    - `siteSettings` → `AdminSettingsService.getSettings()`, wrapped in `{ data: result }`
    - Requires `requireAuth`
    - _Requirements: 11.1, 11.4_
  - [ ] 12.3 Create `admin/src/lib/graphql/resolvers/settings/settings.mutations.ts`
    - `updateSiteSettings(input)` → `AdminSettingsService.updateSettings(input.data)`, return `{ data: result }`
    - Requires `requireAuth`
    - _Requirements: 11.2, 11.4_
  - [ ] 12.4 Load `settings.graphql` in `schema.ts` and wire settings resolvers into `resolvers/index.ts`
    - _Requirements: 11.3_

- [ ] 13. Implement analytics stubs
  - [ ] 13.1 Implement `AnalyticsService.getLowStockAlerts(threshold?)` to call `this.adminClient.analytics.getWeeklyStats()` and extract `lowStockAlerts` from the response
    - _Requirements: 12.3_
  - [ ] 13.2 Implement `AnalyticsService.getTopSellingProducts(startDate?, endDate?, limit?)` to call `this.adminClient.analytics.getSalesStats()` and extract `topProducts` from the response
    - _Requirements: 12.4_
  - [ ]* 13.3 Write unit tests for analytics service methods
    - Test `getLowStockAlerts` returns empty array when backend returns no alerts
    - Test `getTopSellingProducts` respects `limit` parameter
    - _Requirements: 12.3, 12.4_

- [ ] 14. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Apply consistent error handling across all resolvers
  - [ ] 15.1 Audit all resolver files and wrap any bare `await service.method()` calls that are not yet wrapped in try/catch with `mapHttpError`
    - Focus on: `order.queries.ts`, `customer.queries.ts`, `customer.mutations.ts`, `address.mutations.ts`, `shipping.queries.ts`, `shipping.mutations.ts`
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  - [ ]* 15.2 Write property test for HTTP status code → GraphQL error code mapping
    - **Property 2: HTTP status codes map to correct GraphQL error codes**
    - **Validates: Requirements 14.1, 14.2, 14.4**

- [ ] 16. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The `CampaignService` is already fully implemented — campaign tasks only add the GraphQL surface
- The `HttpClient` already throws `{ statusCode, message }` objects — `mapHttpError` just centralises the mapping
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
