import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema, banners } from '@workit/db';
import { eq, desc, and } from 'drizzle-orm';

@Injectable()
export class BannersService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>
    ) { }

    async createBanner(data: typeof banners.$inferInsert) {
        if (data.slug) {
            const existing = await this.db.query.banners.findFirst({
                where: eq(banners.slug, data.slug),
            });
            if (existing) {
                throw new ConflictException('Banner with this slug already exists');
            }
        }
        const [banner] = await this.db.insert(banners).values(data).returning();
        return banner;
    }

    async getBanners() {
        return await this.db.query.banners.findMany({
            orderBy: [desc(schema.banners.sortOrder)],
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
    }

    async getBanner(id: string) {
        return await this.db.query.banners.findFirst({
            where: eq(schema.banners.id, id),
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
    }

    async updateBanner(id: string, data: Partial<typeof banners.$inferInsert>) {
        const [banner] = await this.db
            .update(banners)
            .set(data)
            .where(eq(banners.id, id))
            .returning();
        return banner;
    }

    async deleteBanner(id: string) {
        await this.db.delete(banners).where(eq(banners.id, id));
        return { success: true };
    }

    async getBannersByPosition(position: string, enabled = true) {
        const conditions = enabled
            ? and(
                eq(schema.banners.position, position as any),
                eq(schema.banners.enabled, true)
            )
            : eq(schema.banners.position, position as any);

        return await this.db.query.banners.findMany({
            where: conditions,
            orderBy: [desc(schema.banners.sortOrder)],
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
    }
}
