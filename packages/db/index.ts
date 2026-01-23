import { relations } from "drizzle-orm";
import * as enums from "./schema/enums";
import * as products from "./schema/products";
import * as orders from "./schema/orders";
import * as users from "./schema/users";
import * as marketing from "./schema/marketing";
import * as cms from "./schema/cms";
import * as settings from "./schema/settings";
import * as blog from "./schema/blog";

export * from "./schema/enums";
export * from "./schema/products";
export * from "./schema/orders";
export * from "./schema/users";
export * from "./schema/marketing";
export * from "./schema/cms";
export * from "./schema/settings";
export * from "./schema/blog";

export const productRelations = relations(products.products, ({ one, many }) => ({
    brand: one(products.brands, {
        fields: [products.products.brandId],
        references: [products.brands.id],
    }),
    homepageCollections: many(products.homepageCollectionProducts),
    assets: many(cms.productAssets),
    collections: many(products.productCollections),
    orderLines: many(orders.orderLines),
}));

export const collectionRelations = relations(products.collections, ({ one, many }) => ({
    asset: one(cms.assets, {
        fields: [products.collections.assetId],
        references: [cms.assets.id],
    }),
    parent: one(products.collections, {
        fields: [products.collections.parentId],
        references: [products.collections.id],
        relationName: "parent",
    }),
    children: many(products.collections, {
        relationName: "parent",
    }),
    products: many(products.productCollections),
    banners: many(cms.banners),
}));

export const orderRelations = relations(orders.orders, ({ one, many }) => ({
    customer: one(users.customers, {
        fields: [orders.orders.customerId],
        references: [users.customers.id],
    }),
    shippingAddress: one(orders.addresses, {
        fields: [orders.orders.shippingAddressId],
        references: [orders.addresses.id],
        relationName: "shippingAddress",
    }),
    billingAddress: one(orders.addresses, {
        fields: [orders.orders.billingAddressId],
        references: [orders.addresses.id],
        relationName: "billingAddress",
    }),
    shippingMethod: one(orders.shippingMethods, {
        fields: [orders.orders.shippingMethodId],
        references: [orders.shippingMethods.id],
    }),
    lines: many(orders.orderLines),
    payments: many(orders.payments),
}));

export const customerRelations = relations(users.customers, ({ many }) => ({
    addresses: many(orders.addresses),
    orders: many(orders.orders),
}));

export const assetRelations = relations(cms.assets, ({ many }) => ({
    desktopBanners: many(cms.banners, { relationName: "desktopImage" }),
    mobileBanners: many(cms.banners, { relationName: "mobileImage" }),
    blogs: many(cms.blogs),
    collections: many(products.collections),
    products: many(cms.productAssets),
}));

export const blogRelations = relations(cms.blogs, ({ one, many }) => ({
    asset: one(cms.assets, {
        fields: [cms.blogs.assetId],
        references: [cms.assets.id],
    }),
    categories: many(cms.blogCategories),
}));

export const productCollectionRelations = relations(products.productCollections, ({ one }) => ({
    product: one(products.products, {
        fields: [products.productCollections.productId],
        references: [products.products.id],
    }),
    collection: one(products.collections, {
        fields: [products.productCollections.collectionId],
        references: [products.collections.id],
    }),
}));

export const orderLineRelations = relations(orders.orderLines, ({ one }) => ({
    order: one(orders.orders, {
        fields: [orders.orderLines.orderId],
        references: [orders.orders.id],
    }),
    product: one(products.products, {
        fields: [orders.orderLines.productId],
        references: [products.products.id],
    }),
}));

export const homepageCollectionProductRelations = relations(products.homepageCollectionProducts, ({ one }) => ({
    product: one(products.products, {
        fields: [products.homepageCollectionProducts.productId],
        references: [products.products.id],
    }),
    collection: one(products.homepageCollections, {
        fields: [products.homepageCollectionProducts.collectionId],
        references: [products.homepageCollections.id],
    }),
}));

export const productAssetRelations = relations(cms.productAssets, ({ one }) => ({
    product: one(products.products, {
        fields: [cms.productAssets.productId],
        references: [products.products.id],
    }),
    asset: one(cms.assets, {
        fields: [cms.productAssets.assetId],
        references: [cms.assets.id],
    }),
}));

export const schema = {
    ...enums,
    ...products,
    ...orders,
    ...users,
    ...marketing,
    ...cms,
    ...settings,
    ...blog,
    productRelations,
    collectionRelations,
    orderRelations,
    customerRelations,
    assetRelations,
    blogRelations,
    productCollectionRelations,
    homepageCollectionProductRelations,
    productAssetRelations,
    orderLineRelations,
};
