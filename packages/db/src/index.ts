// Export database instance
export * from './db';

// Export all individual schema tables
export * from "./schema/enums";
export * from "./schema/identity";
export * from "./schema/catalog";
export * from "./schema/marketing";
export * from "./schema/fulfillment";
export * from "./schema/settings";
export * from "./schema/cart";
export * from "./schema/relations";

// IMPORTANT: Also export everything as a 'schema' namespace
// This allows: import { schema } from '@workit/db'
import * as enums from "./schema/enums";
import * as identity from "./schema/identity";
import * as catalog from "./schema/catalog";
import * as marketing from "./schema/marketing";
import * as fulfillment from "./schema/fulfillment";
import * as settings from "./schema/settings";
import * as cart from "./schema/cart";
import * as relations from "./schema/relations";

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
