import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { eq } from 'drizzle-orm';
import { LoginInput, RegisterInput } from '@workit/validation';

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 10;

    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async register(input: RegisterInput) {
        const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);

        const [newUser] = await this.db.insert(schema.user).values({
            id: crypto.randomUUID(),
            email: input.email,
            name: `${input.firstName} ${input.lastName}`,
            firstName: input.firstName,
            lastName: input.lastName,
            emailVerified: true,
            role: 'ADMIN',
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return {
            user: newUser,
        };
    }

    async login(input: LoginInput) {
        const user = await this.db.query.user.findFirst({
            where: eq(schema.user.email, input.email),
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Search for password in account table
        const account = await this.db.query.account.findFirst({
            where: eq(schema.account.userId, user.id),
        });

        if (!account || !account.password) {
            throw new UnauthorizedException('No account found for this user');
        }

        const isPasswordValid = await bcrypt.compare(input.password, account.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            user,
        };
    }
}
