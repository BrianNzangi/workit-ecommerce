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
     * Register new customer
     */
    async register(input: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }) {
        // Check if customer already exists
        const [existing] = await this.db
            .select()
            .from(schema.customers)
            .where(eq(schema.customers.email, input.email))
            .limit(1);

        if (existing) {
            throw new BadRequestException('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Create customer
        const [customer] = await this.db
            .insert(schema.customers)
            .values({
                email: input.email,
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                phoneNumber: input.phoneNumber || '',
            })
            .returning();

        // Generate JWT token
        const token = this.jwtService.sign({
            sub: customer.id,
            email: customer.email,
            type: 'customer',
        });

        return {
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            },
            accessToken: token,
        };
    }

    /**
     * Customer login
     */
    async login(email: string, password: string) {
        const [customer] = await this.db
            .select()
            .from(schema.customers)
            .where(eq(schema.customers.email, email))
            .limit(1);

        if (!customer || !customer.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, customer.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const token = this.jwtService.sign({
            sub: customer.id,
            email: customer.email,
            type: 'customer',
        });

        return {
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            },
            accessToken: token,
        };
    }

    /**
     * Get customer profile
     */
    async getProfile(customerId: string) {
        const [customer] = await this.db
            .select({
                id: schema.customers.id,
                email: schema.customers.email,
                firstName: schema.customers.firstName,
                lastName: schema.customers.lastName,
                phoneNumber: schema.customers.phoneNumber,
            })
            .from(schema.customers)
            .where(eq(schema.customers.id, customerId))
            .limit(1);

        if (!customer) {
            throw new UnauthorizedException('Customer not found');
        }

        return customer;
    }

    /**
     * Update customer profile
     */
    async updateProfile(customerId: string, updates: {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
    }) {
        const [customer] = await this.db
            .update(schema.customers)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(schema.customers.id, customerId))
            .returning({
                id: schema.customers.id,
                email: schema.customers.email,
                firstName: schema.customers.firstName,
                lastName: schema.customers.lastName,
                phoneNumber: schema.customers.phoneNumber,
            });

        return customer;
    }
}
