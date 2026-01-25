import { JwtService } from '@nestjs/jwt';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { LoginInput, RegisterInput } from '@workit/validation';
export declare class AuthService {
    private db;
    private jwtService;
    private readonly SALT_ROUNDS;
    constructor(db: PostgresJsDatabase<typeof schema>, jwtService: JwtService);
    register(input: RegisterInput): Promise<{
        access_token: string;
        user: {
            name: string;
            id: string;
            email: string;
            emailVerified: boolean;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            role: "ADMIN" | "CUSTOMER" | null;
            firstName: string | null;
            lastName: string | null;
        };
    }>;
    login(input: LoginInput): Promise<{
        access_token: string;
        user: {
            name: string;
            id: string;
            email: string;
            emailVerified: boolean;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            role: "ADMIN" | "CUSTOMER" | null;
            firstName: string | null;
            lastName: string | null;
        };
    }>;
    validateUser(payload: any): Promise<{
        name: string;
        id: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: "ADMIN" | "CUSTOMER" | null;
        firstName: string | null;
        lastName: string | null;
    } | null>;
}
