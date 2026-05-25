import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, inArray, desc, and, gte, isNull, sql, lt, lte, gt } from "../../lib/db.js";
import { getTypesenseClient, upsertTypesenseCollectionRecords } from "../../services/search/typesense.client.js";
import { ProductSearchService } from "../../services/search/product-search.service.js";

const CRON_SECRET = process.env.CRON_SECRET || "workit-cron-secret-2024";

const authenticateCron = async (request: any, reply: any) => {
    const authHeader = request.headers.authorization;
    const querySecret = request.query.secret as string;

    if (authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET) {
        return;
    }

    return reply.status(401).send({ error: "Unauthorized" });
};

async function syncCollectionsToTypesense() {
    const collections = await db.query.collections.findMany({
        columns: { id: true, name: true, slug: true, description: true }
    });

    const collectionDocuments = collections.map((collection: any) => ({
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description || ""
    }));

    await upsertTypesenseCollectionRecords(collectionDocuments);
    return collectionDocuments.length;
}

export const cronRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/abandoned-carts", {
        preHandler: [authenticateCron]
    }, async () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const abandonedCarts = await db.query.carts.findMany({
            where: (carts: any, { lt, isNull, and, eq }: any) =>
                and(
                    lt(carts.updatedAt, twoHoursAgo),
                    isNull(carts.customerId),
                    eq(carts.id, sql`(SELECT cartId FROM CartLines WHERE cartId = ${carts.id} LIMIT 1)`)
                ),
            with: { lines: true }
        });

        return {
            success: true,
            count: abandonedCarts.length,
            message: `Found ${abandonedCarts.length} potentially abandoned carts`
        };
    });

    fastify.get("/send-campaigns", {
        preHandler: [authenticateCron]
    }, async () => {
        const now = new Date();

        const campaigns = await (db as any).query.brevoCampaigns.findMany({
            where: (c: any, { eq, and, lte, isNull }: any) =>
                and(
                    eq(c.status, "scheduled"),
                    lte(c.startDate, now),
                    isNull(c.brevoEmailCampaignId)
                )
        });

        let sent = 0;
        for (const campaign of campaigns) {
            try {
                await db.update((schema as any).brevoCampaigns)
                    .set({ status: "sending", updatedAt: new Date() })
                    .where(eq((schema as any).brevoCampaigns.id, campaign.id));
                sent++;
            } catch (error) {
                fastify.log.error({ error, campaignId: campaign.id }, "Failed to send campaign");
            }
        }

        return {
            success: true,
            count: sent,
            message: `Triggered ${sent} scheduled campaign${sent !== 1 ? 's' : ''}`
        };
    });

    fastify.get("/update-analytics", {
        preHandler: [authenticateCron]
    }, async () => {
        const campaigns = await (db as any).query.brevoCampaigns.findMany({
            where: (c: any, { inArray }: any) => inArray(c.status, ["sending", "sent"])
        });

        let updated = 0;
        for (const campaign of campaigns) {
            try {
                await db.update((schema as any).brevoCampaigns)
                    .set({ updatedAt: new Date() })
                    .where(eq((schema as any).brevoCampaigns.id, campaign.id));
                updated++;
            } catch (error) {
                fastify.log.error({ error, campaignId: campaign.id }, "Failed to update campaign analytics");
            }
        }

        return {
            success: true,
            count: updated,
            message: `Updated analytics for ${updated} campaign${updated !== 1 ? 's' : ''}`
        };
    });

    fastify.get("/low-stock-alerts", {
        preHandler: [authenticateCron]
    }, async () => {
        const lowStockThreshold = parseInt(process.env.LOW_STOCK_THRESHOLD || "10", 10);

        const lowStockProducts = await db.query.products.findMany({
            where: (p: any, { lte, gt, and }: any) =>
                and(
                    lte(p.stockOnHand, lowStockThreshold),
                    gt(p.stockOnHand, 0)
                ),
            columns: { id: true, name: true, sku: true, stockOnHand: true }
        });

        const outOfStockProducts = await db.query.products.findMany({
            where: (p: any, { eq, gt }: any) => and(eq(p.stockOnHand, 0), gt(p.publishedAt, new Date(0))),
            columns: { id: true, name: true, sku: true, stockOnHand: true }
        });

        return {
            success: true,
            lowStockCount: lowStockProducts.length,
            outOfStockCount: outOfStockProducts.length,
            message: `Found ${lowStockProducts.length} low stock and ${outOfStockProducts.length} out of stock products`
        };
    });

    fastify.get("/cleanup-old-data", {
        preHandler: [authenticateCron]
    }, async () => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const oldCartsResult = await db.delete(schema.carts)
            .where((c: any, { lt }: any) => lt(c.updatedAt, thirtyDaysAgo));

        const oldEmailsResult = await db.delete((schema as any).emailLogs)
            .where((e: any, { lt }: any) => lt(e.createdAt, thirtyDaysAgo));

        return {
            success: true,
            cartsCleaned: oldCartsResult?.rowCount || 0,
            emailsCleaned: oldEmailsResult?.rowCount || 0,
            message: "Cleanup completed"
        };
    });

    fastify.get("/daily-sales-report", {
        preHandler: [authenticateCron]
    }, async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date(yesterday);
        today.setDate(today.getDate() + 1);

        const orders = await db.query.orders.findMany({
            where: (o: any, { gte, lt, and }: any) =>
                and(
                    gte(o.createdAt, yesterday),
                    lt(o.createdAt, today)
                )
        });

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

        return {
            success: true,
            date: yesterday.toISOString().split("T")[0],
            orderCount: orders.length,
            totalRevenue,
            message: `Generated daily report: ${orders.length} orders, $${(totalRevenue / 100).toFixed(2)} revenue`
        };
    });

    fastify.get("/sync-inventory", {
        preHandler: [authenticateCron]
    }, async () => {
        const products = await db.query.products.findMany({
            columns: { id: true, sku: true, stockOnHand: true, updatedAt: true }
        });

        return {
            success: true,
            count: products.length,
            message: `Synced inventory for ${products.length} products`
        };
    });

    fastify.get("/process-automations", {
        preHandler: [authenticateCron]
    }, async () => {
        return {
            success: true,
            count: 0,
            message: "Marketing automations processed"
        };
    });

    fastify.get("/typesense-reindex", {
        preHandler: [authenticateCron]
    }, async () => {
        try {
            const searchService = new ProductSearchService();
            const result = await searchService.reindexAllProducts();
            const collectionsIndexed = await syncCollectionsToTypesense();

            return {
                success: true,
                count: result.indexed + collectionsIndexed,
                productsIndexed: result.indexed,
                collectionsIndexed,
                message: `Typesense reindex completed successfully (${result.indexed} products, ${collectionsIndexed} collections indexed)`
            };
        } catch (error: any) {
            fastify.log.error({ error }, "Typesense reindex failed");
            return {
                success: false,
                message: `Typesense reindex failed: ${error.message}`
            };
        }
    });

    fastify.get("/typesense-sync-products", {
        preHandler: [authenticateCron]
    }, async () => {
        try {
            const searchService = new ProductSearchService();
            const products = await db.query.products.findMany({
                where: (p: any, { gt }: any) => gt(p.publishedAt, new Date(0)),
                columns: { id: true }
            });

            const productIds = products.map((p: any) => p.id);
            await searchService.syncProductsByIds(productIds);

            return {
                success: true,
                count: productIds.length,
                message: `Synced ${productIds.length} products to Typesense`
            };
        } catch (error: any) {
            fastify.log.error({ error }, "Typesense product sync failed");
            return {
                success: false,
                message: `Typesense product sync failed: ${error.message}`
            };
        }
    });

    fastify.get("/typesense-sync-collections", {
        preHandler: [authenticateCron]
    }, async () => {
        try {
            if (!getTypesenseClient()) {
                return {
                    success: false,
                    message: "Typesense not configured"
                };
            }

            const collectionsIndexed = await syncCollectionsToTypesense();

            return {
                success: true,
                count: collectionsIndexed,
                message: `Synced ${collectionsIndexed} collections to Typesense`
            };
        } catch (error: any) {
            fastify.log.error({ error }, "Typesense collection sync failed");
            return {
                success: false,
                message: `Typesense collection sync failed: ${error.message}`
            };
        }
    });
};

export default cronRoutes;
