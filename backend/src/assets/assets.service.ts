import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema, assets } from '@workit/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class AssetsService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async getAssets(take: number = 50, skip: number = 0) {
        return this.db.query.assets.findMany({
            limit: take,
            offset: skip,
            orderBy: (assets, { desc }) => [desc(assets.createdAt)],
        });
    }

    async getAsset(id: string) {
        const asset = await this.db.query.assets.findFirst({
            where: eq(assets.id, id),
        });

        if (!asset) {
            throw new NotFoundException('Asset not found');
        }

        return asset;
    }

    async createAsset(input: any) {
        const [asset] = await this.db.insert(assets).values({
            name: input.name,
            type: input.type,
            mimeType: input.mimeType,
            fileSize: input.fileSize,
            source: input.source,
            preview: input.preview,
            width: input.width || null,
            height: input.height || null,
        }).returning();

        return asset;
    }

    async deleteAsset(id: string) {
        const result = await this.db.delete(assets)
            .where(eq(assets.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException('Asset not found');
        }

        return result[0];
    }
}
