import { FastifyPluginAsync } from "fastify";
import { db, schema, eq } from "../../../../lib/db.js";
import { storageService } from "../../../../lib/storage.js";
import { v4 as uuidv4 } from "uuid";

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

    // Unified Asset Upload Handler — uploads to MinIO
    const handleFileUpload = async (request: any, reply: any) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ message: "No file uploaded" });
        }

        // Collect the multipart stream into a Buffer
        const chunks: Buffer[] = [];
        for await (const chunk of data.file) {
            chunks.push(chunk);
        }
        const fileBuffer = Buffer.concat(chunks);

        const uniqueFilename = `${Date.now()}-${data.filename}`;

        // Upload to MinIO/S3
        await storageService.upload(uniqueFilename, fileBuffer, data.mimetype);

        const id = uuidv4();
        const assetSource = storageService.getPublicUrl(uniqueFilename);

        const [newAsset] = await db.insert(schema.assets as any).values({
            id,
            name: data.filename,
            type: data.mimetype.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
            mimeType: data.mimetype,
            fileSize: fileBuffer.length,
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
        } as any).where(eq(schema.assets.id as any, id)).returning();

        return updatedAsset;
    });

    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as { id: string };

        // Look up the asset to get the filename for MinIO deletion
        const asset = await db.query.assets.findFirst({
            where: eq(schema.assets.id, id),
        });

        if (asset) {
            // Extract the filename from the source path (e.g., "/uploads/123-file.jpg" → "123-file.jpg")
            const source = (asset as any).source as string;
            const key = source.replace(/^\/uploads\//, "");
            try {
                await storageService.delete(key);
            } catch (err) {
                // Log but don't fail the request if S3 delete fails
                fastify.log.warn({ err, key }, "Failed to delete file from storage");
            }
        }

        await db.delete(schema.assets as any).where(eq(schema.assets.id as any, id));
        return { message: "Asset deleted successfully" };
    });
};

export default assetsAdminRoutes;
