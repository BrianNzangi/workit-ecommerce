import { pgTable, text, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";
import { reviewStatusEnum } from "./enums.js";
import { users } from "./identity.js";
import { products } from "./catalog.js";
import { orders } from "./fulfillment.js";

export const reviews = pgTable("Review", {
    id: text("id").primaryKey().notNull(),
    productId: text("productId").notNull().references(() => products.id),
    customerId: text("customerId").notNull().references(() => users.id),
    orderId: text("orderId").notNull().references(() => orders.id),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 255 }),
    comment: text("comment").notNull(),
    status: reviewStatusEnum("status").default('PENDING').notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
    byProduct: index("Review_product_idx").on(t.productId),
    byCustomer: index("Review_customer_idx").on(t.customerId),
    byStatus: index("Review_status_idx").on(t.status),
    byProductStatus: index("Review_product_status_idx").on(t.productId, t.status),
}));
