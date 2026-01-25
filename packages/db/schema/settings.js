"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.settings = (0, pg_core_1.pgTable)("setting", {
    id: (0, pg_core_1.text)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    key: (0, pg_core_1.varchar)("key", { length: 255 }).notNull().unique(),
    value: (0, pg_core_1.text)("value").notNull(),
    createdAt: (0, pg_core_1.timestamp)("createdAt").notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").notNull().defaultNow(),
}, (table) => {
    return {
        keyIndex: (0, pg_core_1.index)("setting_key_idx").on(table.key),
    };
});
//# sourceMappingURL=settings.js.map