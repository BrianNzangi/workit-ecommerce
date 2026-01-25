"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogPosts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.blogPosts = (0, pg_core_1.pgTable)("BlogPost", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 255 }).notNull().unique(),
    excerpt: (0, pg_core_1.text)("excerpt"),
    content: (0, pg_core_1.text)("content").notNull(),
    featuredImageUrl: (0, pg_core_1.text)("featuredImageUrl"),
    author: (0, pg_core_1.varchar)("author", { length: 255 }),
    published: (0, pg_core_1.boolean)("published").notNull().default(false),
    publishedAt: (0, pg_core_1.timestamp)("publishedAt"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)("deletedAt"),
}, (table) => {
    return {
        slugIndex: (0, pg_core_1.index)("BlogPost_slug_idx").on(table.slug),
        publishedIndex: (0, pg_core_1.index)("BlogPost_published_idx").on(table.published),
        publishedAtIndex: (0, pg_core_1.index)("BlogPost_publishedAt_idx").on(table.publishedAt),
    };
});
//# sourceMappingURL=blog.js.map