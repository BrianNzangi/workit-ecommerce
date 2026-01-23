
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@workit/db';
import { collections, products } from '@workit/db';
import { eq, isNull } from 'drizzle-orm';

@Injectable()
export class CollectionsService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    ) { }

    async getCollections(parentId?: string, includeChildren?: boolean) {
        // If includeChildren is true, return all collections with nested structure
        if (includeChildren) {
            const allCollections = await this.db.select().from(collections);

            // Build tree structure
            const collectionsMap = new Map();
            const rootCollections: any[] = [];

            // First pass: create map of all collections
            allCollections.forEach(collection => {
                collectionsMap.set(collection.id, { ...collection, children: [] });
            });

            // Second pass: build tree
            allCollections.forEach(collection => {
                const collectionWithChildren = collectionsMap.get(collection.id);
                if (collection.parentId) {
                    const parent = collectionsMap.get(collection.parentId);
                    if (parent) {
                        parent.children.push(collectionWithChildren);
                    }
                } else {
                    rootCollections.push(collectionWithChildren);
                }
            });

            return rootCollections;
        }

        // Original filtering logic
        if (parentId !== undefined) {
            // Filter by parentId (null or specific parent)
            if (parentId === 'null' || parentId === '') {
                return this.db.select().from(collections).where(isNull(collections.parentId));
            } else {
                return this.db.select().from(collections).where(eq(collections.parentId, parentId));
            }
        }
        return this.db.select().from(collections);
    }

    async getCollection(id: string) {
        const result = await this.db.select().from(collections).where(eq(collections.id, id));
        if (!result.length) {
            throw new NotFoundException(`Collection with ID ${id} not found`);
        }
        return result[0];
    }

    async createCollection(input: any) {
        const result = await this.db.insert(collections).values(input).returning();
        return result[0];
    }

    async updateCollection(id: string, input: any) {
        const result = await this.db.update(collections).set(input).where(eq(collections.id, id)).returning();
        return result[0];
    }

    async deleteCollection(id: string) {
        await this.db.delete(collections).where(eq(collections.id, id));
    }
}
