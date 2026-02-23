import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export default fp(async (fastify) => {
    await fastify.register(fastifySwagger, {
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

    await fastify.register(fastifySwaggerUi, {
        routePrefix: "/documentation",
    });
});
