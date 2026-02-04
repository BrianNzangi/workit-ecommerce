import fp from "fastify-plugin";
import { db } from "../lib/db.js";

declare module "fastify" {
    interface FastifyInstance {
        db: typeof db;
    }
}

export default fp(async (fastify) => {
    fastify.decorate("db", db);
});
