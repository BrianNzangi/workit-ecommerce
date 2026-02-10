import { pgTable, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./identity.js";
import { products } from "./catalog.js";

export const carts = pgTable("Cart", {
    id: text("id").primaryKey().notNull(),
    customerId: text("customerId").references(() => users.id, { onDelete: 'cascade' }),
    guestId: text("guestId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const cartLines = pgTable("CartLine", {
    id: text("id").primaryKey().notNull(),
    cartId: text("cartId").notNull().references(() => carts.id, { onDelete: 'cascade' }),
    productId: text("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
    variantId: text("variantId"),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (t) => ({
    unq: unique().on(t.cartId, t.productId, t.variantId),
}));

// End of tables
