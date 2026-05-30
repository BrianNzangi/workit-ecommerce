import { relations } from "drizzle-orm";
import * as catalog from "./catalog.js";
import * as marketing from "./marketing.js";
import * as identity from "./identity.js";
import * as fulfillment from "./fulfillment.js";
import * as cart from "./cart.js";
import * as promotions from "./promotions.js";
import * as analytics from "./analytics.js";

// Catalog Relations
export const productsRelations = relations(catalog.products, ({ many, one }) => ({
    assets: many(catalog.productAssets),
    collections: many(catalog.productCollections),
    homepageCollections: many(marketing.homepageCollectionProducts),
    campaignProducts: many(marketing.campaignProducts),
    couponProducts: many(promotions.couponProducts),
    flashSaleProducts: many(promotions.flashSaleProducts),
    featuredDeals: many(promotions.featuredDeals),
    clearanceDeals: many(promotions.clearanceDeals),
    views: many(analytics.productViews),
    brand: one(catalog.brands, {
        fields: [catalog.products.brandId],
        references: [catalog.brands.id],
    }),
    shippingMethod: one(fulfillment.shippingMethods, {
        fields: [catalog.products.shippingMethodId],
        references: [fulfillment.shippingMethods.id],
    }),
}));

export const assetsRelations = relations(catalog.assets, ({ many }) => ({
    productAssets: many(catalog.productAssets),
    collections: many(catalog.collections),
    bannersDesktop: many(marketing.banners, { relationName: "desktopImage" }),
    bannersMobile: many(marketing.banners, { relationName: "mobileImage" }),
    blogs: many(marketing.blogs),
    couponBanners: many(promotions.coupons),
}));

export const productAssetsRelations = relations(catalog.productAssets, ({ one }) => ({
    product: one(catalog.products, {
        fields: [catalog.productAssets.productId],
        references: [catalog.products.id],
    }),
    asset: one(catalog.assets, {
        fields: [catalog.productAssets.assetId],
        references: [catalog.assets.id],
    }),
}));

export const collectionsRelations = relations(catalog.collections, ({ many, one }) => ({
    products: many(catalog.productCollections),
    parent: one(catalog.collections, {
        fields: [catalog.collections.parentId],
        references: [catalog.collections.id],
        relationName: "parentCollection",
    }),
    children: many(catalog.collections, { relationName: "parentCollection" }),
    asset: one(catalog.assets, {
        fields: [catalog.collections.assetId],
        references: [catalog.assets.id],
    }),
    brandCollections: many(catalog.brandCollections),
}));

export const productCollectionsRelations = relations(catalog.productCollections, ({ one }) => ({
    product: one(catalog.products, {
        fields: [catalog.productCollections.productId],
        references: [catalog.products.id],
    }),
    collection: one(catalog.collections, {
        fields: [catalog.productCollections.collectionId],
        references: [catalog.collections.id],
    }),
}));

export const brandsRelations = relations(catalog.brands, ({ many }) => ({
    products: many(catalog.products),
    brandCollections: many(catalog.brandCollections),
}));

export const brandCollectionsRelations = relations(catalog.brandCollections, ({ one }) => ({
    brand: one(catalog.brands, {
        fields: [catalog.brandCollections.brandId],
        references: [catalog.brands.id],
    }),
    collection: one(catalog.collections, {
        fields: [catalog.brandCollections.collectionId],
        references: [catalog.collections.id],
    }),
}));

// Marketing Relations
export const bannersRelations = relations(marketing.banners, ({ one }) => ({
    desktopImage: one(catalog.assets, {
        fields: [marketing.banners.desktopImageId],
        references: [catalog.assets.id],
        relationName: "desktopImage",
    }),
    mobileImage: one(catalog.assets, {
        fields: [marketing.banners.mobileImageId],
        references: [catalog.assets.id],
        relationName: "mobileImage",
    }),
    collection: one(catalog.collections, {
        fields: [marketing.banners.collectionId],
        references: [catalog.collections.id],
    }),
    product: one(catalog.products, {
        fields: [marketing.banners.productId],
        references: [catalog.products.id],
    }),
    campaign: one(marketing.campaigns, {
        fields: [marketing.banners.campaignId],
        references: [marketing.campaigns.id],
    }),
}));

export const blogsRelations = relations(marketing.blogs, ({ one }) => ({
    asset: one(catalog.assets, {
        fields: [marketing.blogs.assetId],
        references: [catalog.assets.id],
    }),
}));

export const homepageCollectionsRelations = relations(marketing.homepageCollections, ({ many }) => ({
    products: many(marketing.homepageCollectionProducts),
}));

export const campaignsRelations = relations(marketing.campaigns, ({ many }) => ({
    campaignProducts: many(marketing.campaignProducts),
    redemptions: many(marketing.campaignRedemptions),
    banners: many(marketing.banners),
}));

export const campaignProductsRelations = relations(marketing.campaignProducts, ({ one }) => ({
    campaign: one(marketing.campaigns, {
        fields: [marketing.campaignProducts.campaignId],
        references: [marketing.campaigns.id],
    }),
    product: one(catalog.products, {
        fields: [marketing.campaignProducts.productId],
        references: [catalog.products.id],
    }),
}));

export const campaignRedemptionsRelations = relations(marketing.campaignRedemptions, ({ one }) => ({
    campaign: one(marketing.campaigns, {
        fields: [marketing.campaignRedemptions.campaignId],
        references: [marketing.campaigns.id],
    }),
    customer: one(identity.users, {
        fields: [marketing.campaignRedemptions.customerId],
        references: [identity.users.id],
    }),
    order: one(fulfillment.orders, {
        fields: [marketing.campaignRedemptions.orderId],
        references: [fulfillment.orders.id],
    }),
}));

export const homepageCollectionProductsRelations = relations(marketing.homepageCollectionProducts, ({ one }) => ({
    collection: one(marketing.homepageCollections, {
        fields: [marketing.homepageCollectionProducts.collectionId],
        references: [marketing.homepageCollections.id],
    }),
    product: one(catalog.products, {
        fields: [marketing.homepageCollectionProducts.productId],
        references: [catalog.products.id],
    }),
}));

// Identity Relations
export const usersRelations = relations(identity.users, ({ many, one }) => ({
    sessions: many(identity.session),
    accounts: many(identity.account),
    orders: many(fulfillment.orders),
    carts: many(cart.carts),
    campaignRedemptions: many(marketing.campaignRedemptions),
    addresses: many(identity.addresses),
    preferences: one(identity.customerPreferences, {
        fields: [identity.users.id],
        references: [identity.customerPreferences.customerId],
    }),
}));

export const customerPreferencesRelations = relations(identity.customerPreferences, ({ one }) => ({
    customer: one(identity.users, {
        fields: [identity.customerPreferences.customerId],
        references: [identity.users.id],
    }),
}));

export const addressesRelations = relations(identity.addresses, ({ one }) => ({
    customer: one(identity.users, {
        fields: [identity.addresses.customerId],
        references: [identity.users.id],
    }),
}));

export const sessionRelations = relations(identity.session, ({ one }) => ({
    user: one(identity.users, {
        fields: [identity.session.userId],
        references: [identity.users.id],
    }),
}));

export const accountRelations = relations(identity.account, ({ one }) => ({
    user: one(identity.users, {
        fields: [identity.account.userId],
        references: [identity.users.id],
    }),
}));

// Fulfillment Relations
export const ordersRelations = relations(fulfillment.orders, ({ one, many }) => ({
    customer: one(identity.users, {
        fields: [fulfillment.orders.customerId],
        references: [identity.users.id],
    }),
    lines: many(fulfillment.orderLines),
    campaignRedemptions: many(marketing.campaignRedemptions),
    shippingAddress: one(identity.addresses, {
        fields: [fulfillment.orders.shippingAddressId],
        references: [identity.addresses.id],
        relationName: "shippingAddress",
    }),
    billingAddress: one(identity.addresses, {
        fields: [fulfillment.orders.billingAddressId],
        references: [identity.addresses.id],
        relationName: "billingAddress",
    }),
    shippingMethod: one(fulfillment.shippingMethods, {
        fields: [fulfillment.orders.shippingMethodId],
        references: [fulfillment.shippingMethods.id],
    }),
}));

export const orderLinesRelations = relations(fulfillment.orderLines, ({ one }) => ({
    order: one(fulfillment.orders, {
        fields: [fulfillment.orderLines.orderId],
        references: [fulfillment.orders.id],
    }),
    product: one(catalog.products, {
        fields: [fulfillment.orderLines.productId],
        references: [catalog.products.id],
    }),
}));

export const paymentsRelations = relations(fulfillment.payments, ({ one }) => ({
    order: one(fulfillment.orders, {
        fields: [fulfillment.payments.orderId],
        references: [fulfillment.orders.id],
    }),
}));

export const shippingMethodsRelations = relations(fulfillment.shippingMethods, ({ many }) => ({
    products: many(catalog.products),
    zones: many(fulfillment.shippingZones),
}));

export const shippingZonesRelations = relations(fulfillment.shippingZones, ({ one, many }) => ({
    shippingMethod: one(fulfillment.shippingMethods, {
        fields: [fulfillment.shippingZones.shippingMethodId],
        references: [fulfillment.shippingMethods.id],
    }),
    cities: many(fulfillment.shippingCities),
}));

export const shippingCitiesRelations = relations(fulfillment.shippingCities, ({ one }) => ({
    zone: one(fulfillment.shippingZones, {
        fields: [fulfillment.shippingCities.zoneId],
        references: [fulfillment.shippingZones.id],
    }),
}));

// Cart Relations
export const cartsRelations = relations(cart.carts, ({ one, many }) => ({
    customer: one(identity.users, {
        fields: [cart.carts.customerId],
        references: [identity.users.id],
    }),
    lines: many(cart.cartLines),
}));

export const cartLinesRelations = relations(cart.cartLines, ({ one }) => ({
    cart: one(cart.carts, {
        fields: [cart.cartLines.cartId],
        references: [cart.carts.id],
    }),
    product: one(catalog.products, {
        fields: [cart.cartLines.productId],
        references: [catalog.products.id],
    }),
}));

// Promotion Relations
export const couponsRelations = relations(promotions.coupons, ({ one, many }) => ({
    bannerImage: one(catalog.assets, {
        fields: [promotions.coupons.bannerImageId],
        references: [catalog.assets.id],
    }),
    products: many(promotions.couponProducts),
}));

export const couponProductsRelations = relations(promotions.couponProducts, ({ one }) => ({
    coupon: one(promotions.coupons, {
        fields: [promotions.couponProducts.couponId],
        references: [promotions.coupons.id],
    }),
    product: one(catalog.products, {
        fields: [promotions.couponProducts.productId],
        references: [catalog.products.id],
    }),
}));

export const flashSalesRelations = relations(promotions.flashSales, ({ many }) => ({
    products: many(promotions.flashSaleProducts),
}));

export const flashSaleProductsRelations = relations(promotions.flashSaleProducts, ({ one }) => ({
    flashSale: one(promotions.flashSales, {
        fields: [promotions.flashSaleProducts.flashSaleId],
        references: [promotions.flashSales.id],
    }),
    product: one(catalog.products, {
        fields: [promotions.flashSaleProducts.productId],
        references: [catalog.products.id],
    }),
}));

export const featuredDealsRelations = relations(promotions.featuredDeals, ({ one }) => ({
    product: one(catalog.products, {
        fields: [promotions.featuredDeals.productId],
        references: [catalog.products.id],
    }),
}));

export const clearanceDealsRelations = relations(promotions.clearanceDeals, ({ one }) => ({
    product: one(catalog.products, {
        fields: [promotions.clearanceDeals.productId],
        references: [catalog.products.id],
    }),
}));

export const productViewsRelations = relations(analytics.productViews, ({ one }) => ({
    product: one(catalog.products, {
        fields: [analytics.productViews.productId],
        references: [catalog.products.id],
    }),
}));
