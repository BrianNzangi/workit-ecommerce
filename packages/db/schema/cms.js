"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannersRelations = exports.banners = exports.blogCategories = exports.blogs = exports.productAssets = exports.assets = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const enums_1 = require("./enums");
const products_1 = require("./products");
const products_2 = require("./products");
exports.assets = (0, pg_core_1.pgTable)("Asset", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    type: (0, enums_1.assetTypeEnum)("type").notNull(),
    mimeType: (0, pg_core_1.varchar)("mimeType", { length: 255 }).notNull(),
    fileSize: (0, pg_core_1.integer)("fileSize").notNull(),
    source: (0, pg_core_1.text)("source").notNull(),
    preview: (0, pg_core_1.text)("preview").notNull(),
    width: (0, pg_core_1.integer)("width"),
    height: (0, pg_core_1.integer)("height"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
}, (table) => {
    return {
        typeIndex: (0, pg_core_1.index)("Asset_type_idx").on(table.type),
    };
});
exports.productAssets = (0, pg_core_1.pgTable)("ProductAsset", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    productId: (0, pg_core_1.text)("productId").notNull().references(() => products_1.products.id, { onDelete: "cascade" }),
    assetId: (0, pg_core_1.text)("assetId").notNull().references(() => exports.assets.id, { onDelete: "cascade" }),
    sortOrder: (0, pg_core_1.integer)("sortOrder").notNull().default(0),
    featured: (0, pg_core_1.boolean)("featured").notNull().default(false),
}, (table) => {
    return {
        productAssetUnique: (0, pg_core_1.unique)("ProductAsset_productId_assetId_key").on(table.productId, table.assetId),
        productIdIndex: (0, pg_core_1.index)("ProductAsset_productId_idx").on(table.productId),
    };
});
exports.blogs = (0, pg_core_1.pgTable)("Blog", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    content: (0, pg_core_1.text)("content").notNull(),
    excerpt: (0, pg_core_1.text)("excerpt"),
    published: (0, pg_core_1.boolean)("published").notNull().default(false),
    publishedAt: (0, pg_core_1.timestamp)("publishedAt"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
    assetId: (0, pg_core_1.text)("assetId").references(() => exports.assets.id),
}, (table) => {
    return {
        slugIndex: (0, pg_core_1.index)("Blog_slug_idx").on(table.slug),
        publishedIndex: (0, pg_core_1.index)("Blog_published_idx").on(table.published),
        publishedAtIndex: (0, pg_core_1.index)("Blog_publishedAt_idx").on(table.publishedAt),
    };
});
exports.blogCategories = (0, pg_core_1.pgTable)("BlogCategory", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    blogId: (0, pg_core_1.text)("blogId").notNull().references(() => exports.blogs.id, { onDelete: "cascade" }),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
}, (table) => {
    return {
        blogIdIndex: (0, pg_core_1.index)("BlogCategory_blogId_idx").on(table.blogId),
    };
});
exports.banners = (0, pg_core_1.pgTable)("Banner", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    position: (0, enums_1.bannerPositionEnum)("position").notNull(),
    enabled: (0, pg_core_1.boolean)("enabled").notNull().default(true),
    sortOrder: (0, pg_core_1.integer)("sortOrder").notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
    desktopImageId: (0, pg_core_1.text)("desktopImageId").references(() => exports.assets.id),
    mobileImageId: (0, pg_core_1.text)("mobileImageId").references(() => exports.assets.id),
    collectionId: (0, pg_core_1.text)("collectionId").references(() => products_2.collections.id),
}, (table) => {
    return {
        positionIndex: (0, pg_core_1.index)("Banner_position_idx").on(table.position),
        enabledIndex: (0, pg_core_1.index)("Banner_enabled_idx").on(table.enabled),
        sortOrderIndex: (0, pg_core_1.index)("Banner_sortOrder_idx").on(table.sortOrder),
    };
});
exports.bannersRelations = (0, drizzle_orm_1.relations)(exports.banners, ({ one }) => ({
    desktopImage: one(exports.assets, {
        fields: [exports.banners.desktopImageId],
        references: [exports.assets.id],
    }),
    mobileImage: one(exports.assets, {
        fields: [exports.banners.mobileImageId],
        references: [exports.assets.id],
    }),
    collection: one(products_2.collections, {
        fields: [exports.banners.collectionId],
        references: [products_2.collections.id],
    }),
}));
//# sourceMappingURL=cms.js.map