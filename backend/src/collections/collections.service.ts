
import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { collections, products } from '@workit/db';
import { eq, isNull, asc } from 'drizzle-orm';

@Injectable()
export class CollectionsService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async getCollections(parentId?: string, includeChildren?: boolean) {
        // If includeChildren is true, return all collections with nested structure
        if (includeChildren) {
            const allCollections = await this.db.select().from(collections).orderBy(asc(collections.sortOrder));

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

            // Ensure children are also sorted (though they should be as allCollections was sorted)
            rootCollections.forEach(root => {
                if (root.children) {
                    root.children.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                }
            });

            return rootCollections.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        }

        // Original filtering logic
        if (parentId !== undefined) {
            // Filter by parentId (null or specific parent)
            if (parentId === 'null' || parentId === '') {
                return this.db.select().from(collections).where(isNull(collections.parentId)).orderBy(asc(collections.sortOrder));
            } else {
                return this.db.select().from(collections).where(eq(collections.parentId, parentId)).orderBy(asc(collections.sortOrder));
            }
        }
        return this.db.select().from(collections).orderBy(asc(collections.sortOrder));
    }

    async getCollection(id: string) {
        const result = await this.db.select().from(collections).where(eq(collections.id, id));
        if (!result.length) {
            throw new NotFoundException(`Collection with ID ${id} not found`);
        }
        return result[0];
    }

    async createCollection(input: any) {
        if (input.slug) {
            const existing = await this.db.select().from(collections).where(eq(collections.slug, input.slug));
            if (existing.length > 0) {
                throw new ConflictException('Collection with this slug already exists');
            }
        }
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
