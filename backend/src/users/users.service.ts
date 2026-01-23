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
        const users = await this.db.select().from(schema.adminUsers);
        return users.map(({ passwordHash, ...user }) => user);
    }

    async create(input: any) {
        const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);
        const [user] = await this.db.insert(schema.adminUsers).values({
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            passwordHash,
            role: input.role,
        }).returning();

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async update(id: string, input: any) {
        const updateData: any = { ...input, updatedAt: new Date() };
        if (input.password) {
            updateData.passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);
            delete updateData.password;
        }

        const [user] = await this.db.update(schema.adminUsers)
            .set(updateData)
            .where(eq(schema.adminUsers.id, id))
            .returning();

        if (!user) throw new NotFoundException('User not found');

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async delete(id: string) {
        const [user] = await this.db.delete(schema.adminUsers)
            .where(eq(schema.adminUsers.id, id))
            .returning();

        if (!user) throw new NotFoundException('User not found');
        return { success: true };
    }
}
