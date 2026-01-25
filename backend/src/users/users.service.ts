import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    private readonly SALT_ROUNDS = 10;

    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async findAll() {
        return this.db.select().from(schema.user);
    }

    async create(input: any) {
        const [user] = await this.db.insert(schema.user).values({
            id: crypto.randomUUID(),
            email: input.email,
            name: `${input.firstName} ${input.lastName}`,
            firstName: input.firstName,
            lastName: input.lastName,
            emailVerified: true,
            role: input.role || 'ADMIN',
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return user;
    }

    async update(id: string, input: any) {
        const updateData: any = {
            ...input,
            updatedAt: new Date(),
        };

        if (input.firstName || input.lastName) {
            // Need to fetch current name parts if only one is provided, or just use naming convention
            updateData.name = `${input.firstName || ''} ${input.lastName || ''}`.trim();
        }

        const [user] = await this.db.update(schema.user)
            .set(updateData)
            .where(eq(schema.user.id, id))
            .returning();

        if (!user) throw new NotFoundException('User not found');

        return user;
    }

    async delete(id: string) {
        const [user] = await this.db.delete(schema.user)
            .where(eq(schema.user.id, id))
            .returning();

        if (!user) throw new NotFoundException('User not found');
        return { success: true };
    }
}
