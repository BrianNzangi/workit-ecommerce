import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StoreAuthService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
        private jwtService: JwtService,
    ) { }

    /**
     * Register new customer - DEPRECATED (Handled by Better Auth)
     */
    async register(input: any) {
        throw new BadRequestException('Use Better Auth endpoints for registration');
    }

    /**
     * Customer login - DEPRECATED (Handled by Better Auth)
     */
    async login(email: string, password: string) {
        throw new BadRequestException('Use Better Auth endpoints for login');
    }

    /**
     * Get customer profile
     */
    async getProfile(userId: string) {
        const [user] = await this.db
            .select({
                id: schema.user.id,
                email: schema.user.email,
                firstName: schema.user.firstName,
                lastName: schema.user.lastName,
                role: schema.user.role,
            })
            .from(schema.user)
            .where(eq(schema.user.id, userId))
            .limit(1);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    /**
     * Update customer profile
     */
    async updateProfile(userId: string, updates: {
        firstName?: string;
        lastName?: string;
    }) {
        const [updatedUser] = await this.db
            .update(schema.user)
            .set({
                ...updates,
                name: `${updates.firstName || ''} ${updates.lastName || ''}`.trim(),
                updatedAt: new Date(),
            })
            .where(eq(schema.user.id, userId))
            .returning({
                id: schema.user.id,
                email: schema.user.email,
                firstName: schema.user.firstName,
                lastName: schema.user.lastName,
                role: schema.user.role,
            });

        return updatedUser;
    }
}
