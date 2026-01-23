import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema, homepageCollections } from '@workit/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class HomepageCollectionsService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async getHomepageCollections() {
        return this.db.query.homepageCollections.findMany({
            orderBy: (homepageCollections, { asc }) => [asc(homepageCollections.sortOrder)],
        });
    }

    async getHomepageCollection(id: string) {
        const collection = await this.db.query.homepageCollections.findFirst({
            where: eq(homepageCollections.id, id),
        });

        if (!collection) {
            throw new NotFoundException('Homepage collection not found');
        }

        return collection;
    }

    async createHomepageCollection(input: any) {
        // Check for duplicate slug
        const existing = await this.db.query.homepageCollections.findFirst({
            where: eq(homepageCollections.slug, input.slug),
        });

        if (existing) {
            throw new ConflictException('Homepage collection with this slug already exists');
        }

        // Auto-assign sort order if not provided
        let sortOrder = input.sortOrder;
        if (sortOrder === undefined || sortOrder === null) {
            // Get the count of existing collections to determine next sort order
            const allCollections = await this.db.query.homepageCollections.findMany();
            sortOrder = allCollections.length;
        }

        const [collection] = await this.db.insert(homepageCollections).values({
            title: input.title,
            slug: input.slug,
            enabled: input.enabled ?? true,
            sortOrder: sortOrder,
        }).returning();

        return collection;
    }

    async updateHomepageCollection(id: string, input: any) {
        // If slug is being updated, check for duplicates
        if (input.slug) {
            const existing = await this.db.query.homepageCollections.findFirst({
                where: eq(homepageCollections.slug, input.slug),
            });

            if (existing && existing.id !== id) {
                throw new ConflictException('Homepage collection with this slug already exists');
            }
        }

        const [collection] = await this.db.update(homepageCollections)
            .set({
                ...input,
                updatedAt: new Date(),
            })
            .where(eq(homepageCollections.id, id))
            .returning();

        if (!collection) {
            throw new NotFoundException('Homepage collection not found');
        }

        return collection;
    }

    async deleteHomepageCollection(id: string) {
        const result = await this.db.delete(homepageCollections)
            .where(eq(homepageCollections.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException('Homepage collection not found');
        }

        return result[0];
    }
}
