import { pgTable, varchar, text, boolean, integer, timestamp, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assetTypeEnum, bannerPositionEnum } from "./enums";
import { products } from "./products";
import { collections } from "./products";

export const assets = pgTable("Asset", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    type: assetTypeEnum("type").notNull(),
    mimeType: varchar("mimeType", { length: 255 }).notNull(),
    fileSize: integer("fileSize").notNull(),
    source: text("source").notNull(),
    preview: text("preview").notNull(),
    width: integer("width"),
    height: integer("height"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => {
    return {
        typeIndex: index("Asset_type_idx").on(table.type),
    };
});

export const productAssets = pgTable("ProductAsset", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    productId: text("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    assetId: text("assetId").notNull().references(() => assets.id, { onDelete: "cascade" }),
    sortOrder: integer("sortOrder").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
}, (table) => {
    return {
        productAssetUnique: unique("ProductAsset_productId_assetId_key").on(table.productId, table.assetId),
        productIdIndex: index("ProductAsset_productId_idx").on(table.productId),
    };
});

export const blogs = pgTable("Blog", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    assetId: text("assetId").references(() => assets.id),
}, (table) => {
    return {
        slugIndex: index("Blog_slug_idx").on(table.slug),
        publishedIndex: index("Blog_published_idx").on(table.published),
        publishedAtIndex: index("Blog_publishedAt_idx").on(table.publishedAt),
    };
});

export const blogCategories = pgTable("BlogCategory", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    blogId: text("blogId").notNull().references(() => blogs.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
}, (table) => {
    return {
        blogIdIndex: index("BlogCategory_blogId_idx").on(table.blogId),
    };
});

export const banners = pgTable("Banner", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    position: bannerPositionEnum("position").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    sortOrder: integer("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    desktopImageId: text("desktopImageId").references(() => assets.id),
    mobileImageId: text("mobileImageId").references(() => assets.id),
    collectionId: text("collectionId").references(() => collections.id),
}, (table) => {
    return {
        positionIndex: index("Banner_position_idx").on(table.position),
        enabledIndex: index("Banner_enabled_idx").on(table.enabled),
        sortOrderIndex: index("Banner_sortOrder_idx").on(table.sortOrder),
    };
});

// Relations
export const bannersRelations = relations(banners, ({ one }) => ({
    desktopImage: one(assets, {
        fields: [banners.desktopImageId],
        references: [assets.id],
    }),
    mobileImage: one(assets, {
        fields: [banners.mobileImageId],
        references: [assets.id],
    }),
    collection: one(collections, {
        fields: [banners.collectionId],
        references: [collections.id],
    }),
}));
