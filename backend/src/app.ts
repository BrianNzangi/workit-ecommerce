import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import authPlugin from "@fastify/auth";
import autoload from "@fastify/autoload";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { serializerCompiler, validatorCompiler, ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

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

    // Register core plugins
    await app.register(sensible);

    app.addHook('onRequest', async (request, reply) => {
        console.log(`[DEBUG] Incoming Request: ${request.method} ${request.url}`);
    });

    await app.register(cors, {
        origin: true, // Configure as needed
        credentials: true,
    });
    await app.register(authPlugin);

    // Register Multipart with file upload limits
    await app.register(import("@fastify/multipart"), {
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max file size
            files: 1,                    // 1 file at a time
        },
    });

    // Ensure storage bucket exists once on startup (idempotent).
    await storageService.ensureBucketExists();

    // Register Swagger
    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: "Workit API",
                description: "Workit Ecommerce API Documentation",
                version: "2.0.0",
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
        },
        transform: jsonSchemaTransform,
    });

    await app.register(fastifySwaggerUi, {
        routePrefix: "/documentation",
    });


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
