import Fastify from "fastify";
import autoload from "@fastify/autoload";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";

import { storageService } from "./lib/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const buildApp = async () => {
    const app = Fastify({
        logger: true,
        routerOptions: {
            ignoreTrailingSlash: true,
        },
    }).withTypeProvider<ZodTypeProvider>();

    // Proxy route: serve files from MinIO/S3 at /uploads/:filename
    app.get("/uploads/:filename", async (request, reply) => {
        const { filename } = request.params as { filename: string };
        try {
            const { stream, contentType, contentLength } = await storageService.getObject(filename);
            reply.header("Content-Type", contentType || "application/octet-stream");
            if (contentLength) {
                reply.header("Content-Length", contentLength);
            }
            reply.header("Cache-Control", "public, max-age=31536000, immutable");
            return reply.send(stream);
        } catch (err: any) {
            if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
                return reply.status(404).send({ message: "File not found" });
            }
            throw err;
        }
    });

    // Manual test route to verify the code is fresh
    app.get("/test-deploy", async () => ({ status: "v3-minio", timestamp: new Date() }));
    app.get("/api", async () => ({
        status: "ok",
        service: "workit-backend",
        routes: {
            auth: "/api/auth",
            products: "/api/products",
            store: "/store",
        },
    }));

    // Set Zod compilers
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.addHook('onRequest', async (request, reply) => {
        console.log(`[DEBUG] Incoming Request: ${request.method} ${request.url}`);
    });

    // Ensure storage bucket exists once on startup (idempotent).
    await storageService.ensureBucketExists();

    // Register database and other global plugins
    await app.register(autoload, {
        dir: join(__dirname, "plugins"),
    });

    // Register modules manually to ensure correct order and prefixes
    // and to avoid autoload recursion issues with the new standardized structure
    const { appModules } = await import("./modules/index.js");
    await app.register(appModules);

    await app.ready();

    if (process.env.PRINT_ROUTES === "true") {
        app.log.info(`\n${app.printRoutes()}`);
    }

    return app;
};
