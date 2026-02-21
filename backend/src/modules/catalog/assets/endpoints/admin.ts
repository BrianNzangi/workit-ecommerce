import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, inArray } from "../../../../lib/db.js";
import { storageService } from "../../../../lib/storage.js";
import { v4 as uuidv4 } from "uuid";

type DeleteResult =
    | { id: string; status: "deleted" }
    | { id: string; status: "not_found" }
    | { id: string; status: "in_use" };

export const assetsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    const isForeignKeyError = (err: any) => err?.code === "23503";

    const deleteAssetFromStorage = async (source?: string | null) => {
        if (!source) return;
        const key = source.replace(/^\/uploads\//, "");

        try {
            await storageService.delete(key);
        } catch (err) {
            // Log but don't fail the request if storage delete fails
            fastify.log.warn({ err, key }, "Failed to delete file from storage");
        }
    };

    const detachAssetReferences = async (assetId: string) => {
        // These relations are "no action" in DB; clear them before deleting the asset row.
        await Promise.all([
            db.update(schema.collections as any)
                .set({ assetId: null } as any)
                .where(eq(schema.collections.assetId as any, assetId)),
            db.update(schema.blogs as any)
                .set({ assetId: null } as any)
                .where(eq(schema.blogs.assetId as any, assetId)),
            db.update(schema.banners as any)
                .set({ desktopImageId: null } as any)
                .where(eq(schema.banners.desktopImageId as any, assetId)),
            db.update(schema.banners as any)
                .set({ mobileImageId: null } as any)
                .where(eq(schema.banners.mobileImageId as any, assetId)),
        ]);
    };

    const deleteAssetById = async (id: string): Promise<DeleteResult> => {
        const asset = await db.query.assets.findFirst({
            where: eq(schema.assets.id, id),
        });

        if (!asset) {
            return { id, status: "not_found" };
        }

        await detachAssetReferences(id);
        await deleteAssetFromStorage((asset as any).source as string);

        try {
            await db.delete(schema.assets as any).where(eq(schema.assets.id as any, id));
            return { id, status: "deleted" };
        } catch (err) {
            if (isForeignKeyError(err)) {
                return { id, status: "in_use" };
            }
            throw err;
        }
    };

    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request) => {
        const { take = 32, skip = 0 } = request.query as { take?: number; skip?: number };

        const assets = await (db as any).query.assets.findMany({
            limit: Number(take),
            offset: Number(skip),
            orderBy: (assets: any, { desc }: any) => [desc(assets.createdAt)],
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

