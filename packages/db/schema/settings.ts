import { pgTable, varchar, text, timestamp, index } from "drizzle-orm/pg-core";

export const settings = pgTable("setting", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    key: varchar("key", { length: 255 }).notNull().unique(),
    value: text("value").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        keyIndex: index("setting_key_idx").on(table.key),
    };
});
