import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const settings = pgTable("setting", {
    id: text("id").primaryKey().notNull(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    value: text("value").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
