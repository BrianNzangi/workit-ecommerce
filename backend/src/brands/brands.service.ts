
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@workit/db';
import { brands } from '@workit/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class BrandsService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    ) { }

    async getBrands() {
        return this.db.select().from(brands);
    }

    async getBrand(id: string) {
        const result = await this.db.select().from(brands).where(eq(brands.id, id));
        return result[0];
    }

    async createBrand(input: any) { // Add proper type
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
