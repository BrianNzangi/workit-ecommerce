import fp from "fastify-plugin";
import { isTypesenseEnabled } from "../services/search/typesense.client.js";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export default fp(async (fastify) => {
    let interval: NodeJS.Timeout | null = null;

    fastify.addHook("onReady", async () => {
        const scheduleEnabled = process.env.TYPESENSE_REINDEX_SCHEDULE_ENABLED !== "false";

        if (!scheduleEnabled || !isTypesenseEnabled()) {
            fastify.log.info(
                {
                    scheduleEnabled,
                    typesenseEnabled: isTypesenseEnabled(),
                },
                "Typesense reindex scheduler is disabled",
            );
            return;
        }

        const intervalMs = Number(process.env.TYPESENSE_REINDEX_INTERVAL_MS || SIX_HOURS_MS);

        const runReindex = async () => {
            try {
                await fastify.jobs.enqueue({
                    type: "search.reindex",
                    payload: {},
                });
                fastify.log.info("Scheduled Typesense reindex job");
            } catch (error) {
                fastify.log.error({ error }, "Failed to schedule Typesense reindex job");
            }
        };

        interval = setInterval(() => {
            void runReindex();
        }, intervalMs);

        fastify.log.info(
            { intervalMs },
            "Typesense reindex scheduler started",
        );
    });

    fastify.addHook("onClose", async () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    });
}, {
    name: "typesense-reindex-scheduler",
    dependencies: ["job-queue"],
});
