"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homepageCollectionProducts = exports.homepageCollections = exports.productCollections = exports.collections = exports.brands = exports.products = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
exports.products = (0, pg_core_1.pgTable)("Product", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    sku: (0, pg_core_1.varchar)("sku", { length: 255 }).unique(),
    description: (0, pg_core_1.text)("description"),
    salePrice: (0, pg_core_1.doublePrecision)("salePrice"),
    originalPrice: (0, pg_core_1.doublePrecision)("originalPrice"),
    stockOnHand: (0, pg_core_1.integer)("stockOnHand").notNull().default(20),
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(true),
    condition: (0, enums_1.productConditionEnum)("condition").notNull().default("NEW"),
    brandId: (0, pg_core_1.text)("brandId"),
    shippingMethodId: (0, pg_core_1.varchar)("shippingMethodId", { length: 255 }).default("standard"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)("deletedAt"),
}, (table) => {
    return {
        slugIndex: (0, pg_core_1.index)("Product_slug_idx").on(table.slug),
        enabledIndex: (0, pg_core_1.index)("Product_enabled_idx").on(table.enabled),
        brandIdIndex: (0, pg_core_1.index)("Product_brandId_idx").on(table.brandId),
        skuIndex: (0, pg_core_1.index)("Product_sku_idx").on(table.sku),
        shippingMethodIdIndex: (0, pg_core_1.index)("Product_shippingMethodId_idx").on(table.shippingMethodId),
        conditionIndex: (0, pg_core_1.index)("Product_condition_idx").on(table.condition),
    };
});
exports.brands = (0, pg_core_1.pgTable)("Brand", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    logoUrl: (0, pg_core_1.text)("logoUrl"),
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        slugIndex: (0, pg_core_1.index)("Brand_slug_idx").on(table.slug),
        enabledIndex: (0, pg_core_1.index)("Brand_enabled_idx").on(table.enabled),
    };
});
exports.collections = (0, pg_core_1.pgTable)("Collection", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    parentId: (0, pg_core_1.text)("parentId"),
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(true),
    showInMostShopped: (0, pg_core_1.boolean)("showInMostShopped").notNull().default(false),
    sortOrder: (0, pg_core_1.integer)("sortOrder").notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
    assetId: (0, pg_core_1.text)("assetId"),
}, (table) => {
    return {
        slugIndex: (0, pg_core_1.index)("Collection_slug_idx").on(table.slug),
        parentIdIndex: (0, pg_core_1.index)("Collection_parentId_idx").on(table.parentId),
        enabledIndex: (0, pg_core_1.index)("Collection_enabled_idx").on(table.enabled),
    };
});
exports.productCollections = (0, pg_core_1.pgTable)("ProductCollection", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    productId: (0, pg_core_1.text)("productId").notNull().references(() => exports.products.id, { onDelete: "cascade" }),
    collectionId: (0, pg_core_1.text)("collectionId").notNull().references(() => exports.collections.id, { onDelete: "cascade" }),
    sortOrder: (0, pg_core_1.integer)("sortOrder").notNull().default(0),
}, (table) => {
    return {
        productCollectionUnique: (0, pg_core_1.unique)("ProductCollection_productId_collectionId_key").on(table.productId, table.collectionId),
        collectionIdIndex: (0, pg_core_1.index)("ProductCollection_collectionId_idx").on(table.collectionId),
    };
});
exports.homepageCollections = (0, pg_core_1.pgTable)("HomepageCollection", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(true),
    sortOrder: (0, pg_core_1.integer)("sortOrder").notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        slugIndex: (0, pg_core_1.index)("HomepageCollection_slug_idx").on(table.slug),
        enabledIndex: (0, pg_core_1.index)("HomepageCollection_enabled_idx").on(table.enabled),
        sortOrderIndex: (0, pg_core_1.index)("HomepageCollection_sortOrder_idx").on(table.sortOrder),
    };
});
exports.homepageCollectionProducts = (0, pg_core_1.pgTable)("HomepageCollectionProduct", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    collectionId: (0, pg_core_1.text)("collectionId").notNull().references(() => exports.homepageCollections.id, { onDelete: "cascade" }),
    productId: (0, pg_core_1.text)("productId").notNull().references(() => exports.products.id, { onDelete: "cascade" }),
    sortOrder: (0, pg_core_1.integer)("sortOrder").notNull().default(0),
}, (table) => {
    return {
        collectionProductUnique: (0, pg_core_1.unique)("HomepageCollectionProduct_collectionId_productId_key").on(table.collectionId, table.productId),
        collectionIdIndex: (0, pg_core_1.index)("HomepageCollectionProduct_collectionId_idx").on(table.collectionId),
    };
});
//# sourceMappingURL=products.js.map