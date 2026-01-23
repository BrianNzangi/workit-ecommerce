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
        const existingUser = await this.db.query.adminUsers.findFirst({
            where: eq(schema.adminUsers.email, input.email),
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(input.password, this.SALT_ROUNDS);

        const [user] = await this.db.insert(schema.adminUsers).values({
            email: input.email,
            passwordHash,
            firstName: input.firstName,
            lastName: input.lastName,
            role: 'ADMIN',
        }).returning();

        const payload = { sub: user.id, email: user.email, role: user.role };
        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: userWithoutPassword,
        };
    }

    async login(input: LoginInput) {
        const user = await this.db.query.adminUsers.findFirst({
            where: eq(schema.adminUsers.email, input.email),
        });

        if (!user || !user.enabled) {
            throw new UnauthorizedException('Invalid credentials or account disabled');
        }

        const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            access_token: await this.jwtService.signAsync(payload),
            user: userWithoutPassword,
        };
    }

    async validateUser(payload: any) {
        const user = await this.db.query.adminUsers.findFirst({
            where: eq(schema.adminUsers.id, payload.sub),
        });

        if (!user || !user.enabled) {
            return null;
        }

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
