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


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const buildApp = async () => {
    const app = Fastify({
        logger: true,
        ignoreTrailingSlash: true,
    }).withTypeProvider<ZodTypeProvider>();

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

    // Register Multipart
    await app.register(import("@fastify/multipart"));

    // Register Static
    await app.register(import("@fastify/static"), {
        root: join(__dirname, "../uploads"),
        prefix: "/uploads/",
    });

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

    return app;
};
