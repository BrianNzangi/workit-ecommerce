// Export database instance
export * from './db.js';

// Export all individual schema tables
export * from "./schema/enums.js";
export * from "./schema/identity.js";
export * from "./schema/catalog.js";
export * from "./schema/marketing.js";
export * from "./schema/fulfillment.js";
export * from "./schema/settings.js";
export * from "./schema/cart.js";
export * from "./schema/relations.js";

// IMPORTANT: Also export everything as a 'schema' namespace
// This allows: import { schema } from '@workit/db'
import * as enums from "./schema/enums.js";
import * as identity from "./schema/identity.js";
import * as catalog from "./schema/catalog.js";
import * as marketing from "./schema/marketing.js";
import * as fulfillment from "./schema/fulfillment.js";
import * as settings from "./schema/settings.js";
import * as cart from "./schema/cart.js";
import * as relations from "./schema/relations.js";

export const schema = {
    ...enums,
    ...identity,
    ...catalog,
    ...marketing,
    ...fulfillment,
    ...settings,
    ...cart,
    ...relations
};

// Re-export commonly used Drizzle ORM functions
export {
    and, eq, or, ilike, desc, asc, sql, count, isNull, isNotNull, inArray,
    not, gt, gte, lt, lte, between, like, notLike, notIlike, exists,
    avg, min, max, sum, sql as raw
} from 'drizzle-orm';
