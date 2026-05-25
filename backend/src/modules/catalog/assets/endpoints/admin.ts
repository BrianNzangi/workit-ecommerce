import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, inArray, and, isNull, desc } from "../../../../lib/db.js";
import { storageService } from "../../../../lib/storage.js";
import { v4 as uuidv4 } from "uuid";

type DeleteResult =
    | { id: string; status: "deleted" }
    | { id: string; status: "not_found" }
    | { id: string; status: "in_use" };

export const assetsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    const deleteAssetById = async (id: string): Promise<DeleteResult> => {
        const asset = await db.query.assets.findFirst({
            where: and(eq(schema.assets.id, id), isNull(schema.assets.deletedAt)),
        });

        if (!asset) {
            return { id, status: "not_found" };
        }

        await db
            .update(schema.assets as any)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date(),
            } as any)
            .where(eq(schema.assets.id as any, id));

        return { id, status: "deleted" };
    };

    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request) => {
        const { take = 32, skip = 0 } = request.query as { take?: number; skip?: number };

        const assets = await (db as any).query.assets.findMany({
            where: isNull(schema.assets.deletedAt),
            limit: Number(take),
            offset: Number(skip),
            orderBy: [desc(schema.assets.createdAt)],
        });

        return assets;
    });

    const handleFileUpload = async (request: any, reply: any) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ message: "No file uploaded" });
        }

        const chunks: Buffer[] = [];
        for await (const chunk of data.file) {
            chunks.push(chunk);
        }
        const fileBuffer = Buffer.concat(chunks);

        const uniqueFilename = `${Date.now()}-${data.filename}`;
        await storageService.upload(uniqueFilename, fileBuffer, data.mimetype);

        const id = uuidv4();
        const assetSource = storageService.getPublicUrl(uniqueFilename);

        const [newAsset] = await db.insert(schema.assets as any).values({
            id,
            name: data.filename,
            type: data.mimetype.startsWith("image/") ? "IMAGE" : "DOCUMENT",
            mimeType: data.mimetype,
            fileSize: fileBuffer.length,
            source: assetSource,
            preview: assetSource,
            width: null,
            height: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }).returning();

        return {
            ...newAsset,
            url: assetSource,
            source: assetSource,
            success: true,
        };
    };

    fastify.post("/upload", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, handleFileUpload);

    fastify.post("/presign", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request, reply) => {
        const { filename, contentType } = request.body as { filename: string; contentType: string };

        if (!filename || !contentType) {
            return reply.status(400).send({ message: "filename and contentType are required" });
        }

        const key = `${Date.now()}-${filename}`;
        const uploadUrl = await storageService.generatePresignedUrl(key, contentType);
        const publicUrl = storageService.getPublicUrl(key);

        return { key, uploadUrl, publicUrl };
    });

    fastify.post("/register", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request, reply) => {
        const { key, filename, contentType, fileSize, width, height } = request.body as {
            key: string;
            filename: string;
            contentType: string;
            fileSize?: number;
            width?: number | null;
            height?: number | null;
        };

        if (!key || !filename) {
            return reply.status(400).send({ message: "key and filename are required" });
        }

        const id = uuidv4();
        const assetSource = storageService.getPublicUrl(key);

        const [newAsset] = await db.insert(schema.assets as any).values({
            id,
            name: filename,
            type: contentType.startsWith("image/") ? "IMAGE" : "DOCUMENT",
            mimeType: contentType,
            fileSize: fileSize || null,
            source: assetSource,
            preview: assetSource,
            width: width || null,
            height: height || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }).returning();

        return {
            ...newAsset,
            url: assetSource,
            source: assetSource,
            success: true,
        };
    });

    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, handleFileUpload);

    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request) => {
        const { id } = request.params as { id: string };
        const { name } = request.body as any;
        const updatedAsset = await db.update(schema.assets as any).set({
            name,
            updatedAt: new Date(),
        } as any).where(eq(schema.assets.id as any, id)).returning();

        return updatedAsset;
    });

    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };

        try {
            const result = await deleteAssetById(id);

            if (result.status === "not_found") {
                return reply.status(404).send({ message: "Asset not found" });
            }

            if (result.status === "in_use") {
                return reply.status(409).send({ message: "Asset is still referenced by other records" });
            }

            return { message: "Asset deleted successfully" };
        } catch (err) {
            fastify.log.error({ err, id }, "Failed to delete asset");
            return reply.status(500).send({ message: "Failed to delete asset" });
        }
    });

    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request, reply) => {
        const { ids } = request.body as { ids?: string[] };

        if (!Array.isArray(ids) || ids.length === 0) {
            return reply.status(400).send({ success: false, message: "No IDs provided" });
        }

        const uniqueIds = [...new Set(ids)];
        const results = await Promise.all(
            uniqueIds.map(async (id) => {
                try {
                    return await deleteAssetById(id);
                } catch (err) {
                    fastify.log.error({ err, id }, "Failed to delete asset in bulk");
                    return { id, status: "in_use" as const };
                }
            })
        );

        const deleted = results.filter((result) => result.status === "deleted").map((result) => result.id);
        const failed = results.filter((result) => result.status !== "deleted");

        return {
            success: failed.length === 0,
            count: deleted.length,
            deleted,
            failed,
        };
    });
};

export default assetsAdminRoutes;

