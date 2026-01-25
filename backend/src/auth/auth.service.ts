import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
        private jwtService: JwtService,
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

        // Note: Better Auth handles the account table separately.
        // For now, we are just ensuring the user exists in the unified table.
        // Usually, Better Auth registration happens via its own API.

        const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: newUser,
        };
    }

    async login(input: LoginInput) {
        // Better Auth uses the 'account' table for passwords.
        // Since we are moving to Better Auth, login should eventually be handled 
        // by the Better Auth client on the Admin side as well.
        // This is a temporary bridge.

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

        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user,
        };
    }

    async validateUser(payload: any) {
        const user = await this.db.query.user.findFirst({
            where: eq(schema.user.id, payload.sub),
        });

        if (!user) {
            return null;
        }

        return user;
    }
}
