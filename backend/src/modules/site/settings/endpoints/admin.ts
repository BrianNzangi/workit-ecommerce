
import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import {
    RBAC_ROLE_PERMISSIONS_SETTING_KEY,
    invalidateRolePermissionsCache,
    sanitizeRolePermissionsConfig,
} from "../../../../lib/rbac.js";

export const settingsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Settings
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('settings.manage')]
    }, async () => {
        const results = await db.select().from(schema.settings);
        // Convert array to object key-value for frontend convenience if needed? 
        // Or keep as array lists. Admin usually expects an object map or list.
        // Let's return list for consistency with other APIs, but frontend might expect object map.
        // Assuming list based on typical patterns unless proven otherwise.

        // Checking schema: key, value.
        // Let's return dictionary format as it is usually easier for settings.
        const settingsMap: Record<string, any> = {};
        results.forEach((s: any) => {
            try {
                settingsMap[s.key] = JSON.parse(s.value);
            } catch {
                settingsMap[s.key] = s.value;
            }
        });

        return settingsMap;
    });

    // Update Settings (Bulk Upsert)
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('settings.manage')]
    }, async (request) => {
        const settingsData = request.body as Record<string, any>;
        const hasRolePermissionsUpdate = Object.prototype.hasOwnProperty.call(
            settingsData,
            RBAC_ROLE_PERMISSIONS_SETTING_KEY,
        );

        // Loop through keys and upsert
        const promises = Object.entries(settingsData).map(async ([key, value]) => {
            const normalizedValue =
                key === RBAC_ROLE_PERMISSIONS_SETTING_KEY
                    ? sanitizeRolePermissionsConfig(value)
                    : value;
            const stringValue = typeof normalizedValue === 'object'
                ? JSON.stringify(normalizedValue)
                : String(normalizedValue);

            const existing = await db.query.settings.findFirst({
                where: eq(schema.settings.key, key)
            });

            if (existing) {
                return db.update(schema.settings)
                    .set({ value: stringValue, updatedAt: new Date() })
                    .where(eq(schema.settings.key, key));
            } else {
                return db.insert(schema.settings).values({
                    id: uuidv4(),
                    key,
                    value: stringValue
                });
            }
        });

        await Promise.all(promises);
        if (hasRolePermissionsUpdate) {
            invalidateRolePermissionsCache();
        }
        return { success: true };
    });
};

export default settingsAdminRoutes;

