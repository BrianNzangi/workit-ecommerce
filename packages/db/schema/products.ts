import { pgTable, varchar, text, doublePrecision, integer, boolean, timestamp, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { productConditionEnum } from "./enums";

export const products = pgTable("Product", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    sku: varchar("sku", { length: 255 }).unique(),
    description: text("description"),
    salePrice: doublePrecision("salePrice"),
    originalPrice: doublePrecision("originalPrice"),
    stockOnHand: integer("stockOnHand").notNull().default(20),
    enabled: boolean("enabled").notNull().default(true),
    condition: productConditionEnum("condition").notNull().default("NEW"),
    brandId: text("brandId"),
    shippingMethodId: varchar("shippingMethodId", { length: 255 }).default("standard"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    deletedAt: timestamp("deletedAt"),
}, (table) => {
    return {
        slugIndex: index("Product_slug_idx").on(table.slug),
        enabledIndex: index("Product_enabled_idx").on(table.enabled),
        brandIdIndex: index("Product_brandId_idx").on(table.brandId),
        skuIndex: index("Product_sku_idx").on(table.sku),
        shippingMethodIdIndex: index("Product_shippingMethodId_idx").on(table.shippingMethodId),
        conditionIndex: index("Product_condition_idx").on(table.condition),
    };
});

export const brands = pgTable("Brand", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    logoUrl: text("logoUrl"),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        slugIndex: index("Brand_slug_idx").on(table.slug),
        enabledIndex: index("Brand_enabled_idx").on(table.enabled),
    };
});

export const collections = pgTable("Collection", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    parentId: text("parentId"),
    enabled: boolean("enabled").notNull().default(true),
    showInMostShopped: boolean("showInMostShopped").notNull().default(false),
    sortOrder: integer("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    assetId: text("assetId"),
}, (table) => {
    return {
        slugIndex: index("Collection_slug_idx").on(table.slug),
        parentIdIndex: index("Collection_parentId_idx").on(table.parentId),
        enabledIndex: index("Collection_enabled_idx").on(table.enabled),
    };
});

export const productCollections = pgTable("ProductCollection", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    productId: text("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    collectionId: text("collectionId").notNull().references(() => collections.id, { onDelete: "cascade" }),
    sortOrder: integer("sortOrder").notNull().default(0),
}, (table) => {
    return {
        productCollectionUnique: unique("ProductCollection_productId_collectionId_key").on(table.productId, table.collectionId),
        collectionIdIndex: index("ProductCollection_collectionId_idx").on(table.collectionId),
    };
});

export const homepageCollections = pgTable("HomepageCollection", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    enabled: boolean("enabled").notNull().default(true),
    sortOrder: integer("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        slugIndex: index("HomepageCollection_slug_idx").on(table.slug),
        enabledIndex: index("HomepageCollection_enabled_idx").on(table.enabled),
        sortOrderIndex: index("HomepageCollection_sortOrder_idx").on(table.sortOrder),
    };
});

export const homepageCollectionProducts = pgTable("HomepageCollectionProduct", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    collectionId: text("collectionId").notNull().references(() => homepageCollections.id, { onDelete: "cascade" }),
    productId: text("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    sortOrder: integer("sortOrder").notNull().default(0),
}, (table) => {
    return {
        collectionProductUnique: unique("HomepageCollectionProduct_collectionId_productId_key").on(table.collectionId, table.productId),
        collectionIdIndex: index("HomepageCollectionProduct_collectionId_idx").on(table.collectionId),
    };
});

// Relationships will be added to index.ts
