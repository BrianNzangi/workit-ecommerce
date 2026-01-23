import { pgTable, varchar, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const blogPosts = pgTable("BlogPost", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    featuredImageUrl: text("featuredImageUrl"),
    author: varchar("author", { length: 255 }),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    deletedAt: timestamp("deletedAt"),
}, (table) => {
    return {
        slugIndex: index("BlogPost_slug_idx").on(table.slug),
        publishedIndex: index("BlogPost_published_idx").on(table.published),
        publishedAtIndex: index("BlogPost_publishedAt_idx").on(table.publishedAt),
    };
});
