import { pgTable, text, varchar, integer, boolean, doublePrecision, unique, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { assetTypeEnum, productConditionEnum } from "./enums.js";

export const assets = pgTable("Asset", {
    id: text("id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: assetTypeEnum("type").notNull(),
    mimeType: varchar("mimeType", { length: 255 }).notNull(),
    fileSize: integer("fileSize").notNull(),
    source: text("source").notNull(),
    preview: text("preview").notNull(),
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const brands = pgTable("Brand", {
    id: text("id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    logoUrl: text("logoUrl"),
    enabled: boolean("enabled").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const collections = pgTable("Collection", {
    id: text("id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    parentId: text("parentId"),
    enabled: boolean("enabled").default(true).notNull(),
    showInMostShopped: boolean("showInMostShopped").default(false).notNull(),
    sortOrder: integer("sortOrder").default(0).notNull(),
    assetId: text("assetId").references(() => assets.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
    parentFk: foreignKey({
        columns: [t.parentId],
        foreignColumns: [t.id],
    }),
}));

export const products = pgTable("Product", {
    id: text("id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    sku: varchar("sku", { length: 255 }).unique(),
    description: text("description"),
    salePrice: doublePrecision("salePrice"),
    originalPrice: doublePrecision("originalPrice"),
    stockOnHand: integer("stockOnHand").default(20).notNull(),
    enabled: boolean("enabled").default(true).notNull(),
    condition: productConditionEnum("condition").default('NEW').notNull(),
    brandId: text("brandId").references(() => brands.id),
    shippingMethodId: varchar("shippingMethodId", { length: 255 }).default('standard'),
    vat: doublePrecision("vat").default(0).notNull(),
    vatInclusive: boolean("vatInclusive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
});

export const productAssets = pgTable("ProductAsset", {
    id: text("id").primaryKey().notNull(),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
    assetId: text("assetId").notNull().references(() => assets.id, { onDelete: 'cascade' }),
    sortOrder: integer("sortOrder").default(0).notNull(),
    featured: boolean("featured").default(false).notNull(),
}, (t) => ({
    unq: unique().on(t.productId, t.assetId),
}));

export const productCollections = pgTable("ProductCollection", {
    id: text("id").primaryKey().notNull(),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
    collectionId: text("collectionId").notNull().references(() => collections.id, { onDelete: 'cascade' }),
    sortOrder: integer("sortOrder").default(0).notNull(),
}, (t) => ({
    unq: unique().on(t.productId, t.collectionId),
}));
