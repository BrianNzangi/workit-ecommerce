import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, desc, and, gte, lte, SQL } from 'drizzle-orm';
import * as schema from '@workit/db';
import { DRIZZLE } from '../database/database.module';

@Injectable()
export class CampaignsService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async createCampaign(data: typeof schema.campaigns.$inferInsert) {
        if (data.slug) {
            const existing = await this.db.query.campaigns.findFirst({
                where: eq(schema.campaigns.slug, data.slug),
            });
            if (existing) {
                throw new ConflictException('Campaign with this slug already exists');
            }
        }
        const [campaign] = await this.db
            .insert(schema.campaigns)
            .values(data)
            .returning();
        return campaign;
    }

    async getCampaigns(filters?: {
        status?: string;
        type?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        let query = this.db
            .select()
            .from(schema.campaigns)
            .orderBy(desc(schema.campaigns.createdAt));

        // Apply filters if provided
        const conditions: SQL[] = [];
        if (filters?.status) {
            conditions.push(eq(schema.campaigns.status, filters.status as any));
        }
        if (filters?.type) {
            conditions.push(eq(schema.campaigns.type, filters.type as any));
        }
        if (filters?.startDate) {
            conditions.push(gte(schema.campaigns.startDate, filters.startDate));
        }
        if (filters?.endDate) {
            conditions.push(lte(schema.campaigns.endDate, filters.endDate));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        return await query;
    }

    async getCampaign(id: string) {
        const [campaign] = await this.db
            .select()
            .from(schema.campaigns)
            .where(eq(schema.campaigns.id, id));

        if (!campaign) {
            throw new NotFoundException(`Campaign with ID ${id} not found`);
        }

        return campaign;
    }

    async getCampaignBySlug(slug: string) {
        const [campaign] = await this.db
            .select()
            .from(schema.campaigns)
            .where(eq(schema.campaigns.slug, slug));

        if (!campaign) {
            throw new NotFoundException(`Campaign with slug ${slug} not found`);
        }

        return campaign;
    }

    async updateCampaign(id: string, data: Partial<typeof schema.campaigns.$inferInsert>) {
        const [campaign] = await this.db
            .update(schema.campaigns)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(schema.campaigns.id, id))
            .returning();

        if (!campaign) {
            throw new NotFoundException(`Campaign with ID ${id} not found`);
        }

        return campaign;
    }

    async deleteCampaign(id: string) {
        const [campaign] = await this.db
            .delete(schema.campaigns)
            .where(eq(schema.campaigns.id, id))
            .returning();

        if (!campaign) {
            throw new NotFoundException(`Campaign with ID ${id} not found`);
        }

        return campaign;
    }

    async getActiveCampaigns() {
        const now = new Date();
        return await this.db
            .select()
            .from(schema.campaigns)
            .where(
                and(
                    eq(schema.campaigns.status, 'ACTIVE'),
                    lte(schema.campaigns.startDate, now),
                    gte(schema.campaigns.endDate, now)
                )
            )
            .orderBy(desc(schema.campaigns.startDate));
    }

    async updateCampaignStats(id: string, stats: {
        emailsSent?: number;
        emailsOpened?: number;
        emailsClicked?: number;
        conversions?: number;
        revenue?: number;
    }) {
        return await this.updateCampaign(id, stats);
    }
}
