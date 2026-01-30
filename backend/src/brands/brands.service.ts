
import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { brands } from '@workit/db';
import { eq, or } from 'drizzle-orm';

@Injectable()
export class BrandsService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async getBrands() {
        return this.db.select().from(brands);
    }

    async getBrand(id: string) {
        const result = await this.db.select().from(brands).where(eq(brands.id, id));
        return result[0];
    }

    async createBrand(input: any) {
        if (input.name || input.slug) {
            const conditions: any[] = [];
            if (input.name) conditions.push(eq(brands.name, input.name));
            if (input.slug) conditions.push(eq(brands.slug, input.slug));

            if (conditions.length > 0) {
                const existing = await this.db.select().from(brands).where(or(...conditions));
                if (existing.length > 0) {
                    throw new ConflictException('Brand with this name or slug already exists');
                }
            }
        }
        const result = await this.db.insert(brands).values(input).returning();
        return result[0];
    }

    async updateBrand(id: string, input: any) {
        const result = await this.db.update(brands).set(input).where(eq(brands.id, id)).returning();
        return result[0];
    }

    async deleteBrand(id: string) {
        await this.db.delete(brands).where(eq(brands.id, id));
    }
}
