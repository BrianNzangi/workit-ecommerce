import { FastifyPluginAsync } from "fastify";
import { db, schema, eq } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import fs from "node:fs";
import util from "node:util";
import { pipeline } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "url";

const pump = util.promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const assetsAdminRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { take = 32, skip = 0 } = request.query as { take?: number, skip?: number };

        const assets = await (db as any).query.assets.findMany({
            limit: Number(take),
            offset: Number(skip),
            orderBy: (assets: any, { desc }: any) => [desc(assets.createdAt)],
        });

        return assets;
    });

    // Unified Asset Upload Handler
    const handleFileUpload = async (request: any, reply: any) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ message: "No file uploaded" });
        }

        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const uniqueFilename = `${Date.now()}-${data.filename}`;
        const savePath = path.join(uploadsDir, uniqueFilename);

        await pump(data.file, fs.createWriteStream(savePath));

        const stats = fs.statSync(savePath);

        const id = uuidv4();
        const assetSource = `/uploads/${uniqueFilename}`;

        const [newAsset] = await db.insert(schema.assets as any).values({
            id,
            name: data.filename,
            type: data.mimetype.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
            mimeType: data.mimetype,
            fileSize: stats.size,
            source: assetSource,
            preview: assetSource,
            width: null,
            height: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Return standardized response for both asset and url/source fields
        return {
            ...newAsset,
            url: assetSource,
            source: assetSource,
            success: true
        };
    };

    // Asset Upload (Compatibility and standard)
    fastify.post("/upload", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, handleFileUpload);

    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, handleFileUpload);

    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const { name, url, altText } = request.body as any;
        const updatedAsset = await db.update(schema.assets as any).set({
            name,
            // url, 
            // altText 
        } as any).where(eq(schema.assets.id as any, id)).returning();

        return updatedAsset;
    });

    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        await db.delete(schema.assets as any).where(eq(schema.assets.id as any, id));
        return { message: "Asset deleted successfully" };
    });
};

export default assetsAdminRoutes;
