import fp from "fastify-plugin";
import { productSearchService } from "../services/search/product-search.service.js";
import { isTypesenseEnabled } from "../services/search/typesense.client.js";

type JobType = "search.sync" | "search.delete" | "search.reindex";

type JobPayloadMap = {
    "search.sync": { productIds: string[] };
    "search.delete": { productIds: string[] };
    "search.reindex": { batchSize?: number };
};

type BaseJob = {
    id: string;
    attempts: number;
    maxAttempts: number;
};

type Job = {
    [K in JobType]: BaseJob & {
        type: K;
        payload: JobPayloadMap[K];
    }
}[JobType];

type EnqueueJob = Omit<Job, "id" | "attempts" | "maxAttempts"> &
    Partial<Pick<Job, "id" | "attempts" | "maxAttempts">>;

export interface JobQueue {
    enabled: boolean;
    enqueue: (job: EnqueueJob) => Promise<void>;
}

declare module "fastify" {
    interface FastifyInstance {
        jobs: JobQueue;
    }
}

const QUEUE_KEY = "jobs:queue";
const DELAYED_KEY = "jobs:delayed";
const DLQ_KEY = "jobs:dlq";

const nextDelayMs = (attempts: number) => Math.min(60_000, Math.max(1_000, 2 ** attempts * 1_000));

export default fp(async (fastify) => {
    let stopped = false;

    const handleJob = async (job: Job) => {
        switch (job.type) {
            case "search.sync": {
                if (!isTypesenseEnabled()) return;
                const ids = job.payload.productIds || [];
                if (ids.length === 0) return;
                await productSearchService.syncProductsByIds(ids);
                return;
            }
            case "search.delete": {
                if (!isTypesenseEnabled()) return;
                const ids = job.payload.productIds || [];
                if (ids.length === 0) return;
                await productSearchService.deleteProductsByIds(ids);
                return;
            }
            case "search.reindex": {
                if (!isTypesenseEnabled()) return;
                const batchSize = job.payload.batchSize;
                await productSearchService.reindexAllProducts(batchSize);
                return;
            }
            default: {
                fastify.log.warn({ job }, "Unknown job type");
            }
        }
    };

    const enqueue: JobQueue["enqueue"] = async (job) => {
        const baseJob = {
            id: job.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            attempts: job.attempts ?? 0,
            maxAttempts: job.maxAttempts ?? 5,
            ...job,
        } as Job;

        if (!fastify.redis) {
            try {
                await handleJob(baseJob);
            } catch (error) {
                fastify.log.error({ error, job: baseJob }, "Inline job failed");
            }
            return;
        }

        await fastify.redis.rpush(QUEUE_KEY, JSON.stringify(baseJob));
    };

    const workerLoop = async () => {
        if (!fastify.redis) return;

        while (!stopped) {
            try {
                const now = Date.now();
                const due = await fastify.redis.zrangebyscore(DELAYED_KEY, 0, now, "LIMIT", 0, 10);
                if (due.length > 0) {
                    const pipeline = fastify.redis.pipeline();
                    due.forEach((payload: string) => {
                        pipeline.zrem(DELAYED_KEY, payload);
                        pipeline.rpush(QUEUE_KEY, payload);
                    });
                    await pipeline.exec();
                }

                const result = await fastify.redis.blpop(QUEUE_KEY, 5);
                if (!result) continue;

                const payload = result[1];
                if (!payload) continue;

                const job = JSON.parse(payload) as Job;
                try {
                    await handleJob(job);
                } catch (error) {
                    const attempts = (job.attempts ?? 0) + 1;
                    if (attempts < (job.maxAttempts ?? 5)) {
                        const delayedJob = { ...job, attempts };
                        const delayMs = nextDelayMs(attempts);
                        await fastify.redis.zadd(DELAYED_KEY, String(Date.now() + delayMs), JSON.stringify(delayedJob));
                    } else {
                        await fastify.redis.rpush(
                            DLQ_KEY,
                            JSON.stringify({
                                ...job,
                                attempts,
                                failedAt: new Date().toISOString(),
                                error: error instanceof Error ? error.message : String(error),
                            }),
                        );
                    }
                    fastify.log.error({ error, job }, "Job processing failed");
                }
            } catch (error) {
                if (stopped) return;
                fastify.log.error({ error }, "Job processing failed");
            }
        }
    };

    fastify.decorate("jobs", {
        enabled: Boolean(fastify.redis),
        enqueue,
    });

    fastify.addHook("onReady", async () => {
        if (!fastify.redis) return;
        void workerLoop();
    });

    fastify.addHook("onClose", async () => {
        stopped = true;
    });
}, { name: "job-queue", dependencies: ["redis"] });
