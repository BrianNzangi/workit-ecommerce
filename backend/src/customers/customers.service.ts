import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class CustomersService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async findAll() {
        const customers = await this.db.select().from(schema.customers).orderBy(desc(schema.customers.createdAt));
        return customers.map(({ passwordHash, ...customer }) => customer);
    }

    async findOne(id: string) {
        const [customer] = await this.db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
        if (!customer) throw new NotFoundException('Customer not found');

        const { passwordHash, ...customerWithoutPassword } = customer;
        return customerWithoutPassword;
    }

    async create(input: any) {
        const [customer] = await this.db.insert(schema.customers).values({
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            phoneNumber: input.phoneNumber,
            passwordHash: '', // Typically set via store-auth or empty for guest
            enabled: input.enabled ?? true,
        }).returning();

        return customer;
    }

    async update(id: string, input: any) {
        const [customer] = await this.db.update(schema.customers)
            .set({
                ...input,
                updatedAt: new Date()
            })
            .where(eq(schema.customers.id, id))
            .returning();

        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    async delete(id: string) {
        const [customer] = await this.db.delete(schema.customers)
            .where(eq(schema.customers.id, id))
            .returning();

        if (!customer) throw new NotFoundException('Customer not found');
        return { success: true };
    }
}
