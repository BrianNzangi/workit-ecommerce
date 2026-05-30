import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { products } from "./catalog.js";

export const productViews = pgTable("ProductView", {
    id: text("id").primaryKey().notNull(),
    productId: text("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
    sessionId: text("sessionId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
});
