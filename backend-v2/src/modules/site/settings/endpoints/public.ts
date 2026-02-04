import { FastifyPluginAsync } from "fastify";
import { db, schema } from "../../../../lib/db.js";

export const settingsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/", {
        schema: {
            tags: ["Settings"]
        }
    }, async () => {
        const results = await db.select().from(schema.settings);

        const settingsMap: Record<string, any> = {};
        const publicPrefixes = ['general.', 'payments.paystack_public_key', 'payments.paystack_enabled', 'taxes.', 'shipping.'];

        results.forEach((s: any) => {
            // Only include non-sensitive settings
            if (publicPrefixes.some(prefix => s.key.startsWith(prefix)) && !s.key.includes('secret')) {
                try {
                    settingsMap[s.key] = JSON.parse(s.value);
                } catch {
                    settingsMap[s.key] = s.value;
                }
            }
        });

        return settingsMap;
    });
};

export default settingsPublicRoutes;
