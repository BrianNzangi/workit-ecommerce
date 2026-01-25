import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { JwtService } from '@nestjs/jwt';
export declare class StoreAuthService {
    private db;
    private jwtService;
    constructor(db: PostgresJsDatabase<typeof schema>, jwtService: JwtService);
    register(input: any): Promise<void>;
    login(email: string, password: string): Promise<void>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: "ADMIN" | "CUSTOMER" | null;
    }>;
    updateProfile(userId: string, updates: {
        firstName?: string;
        lastName?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: "ADMIN" | "CUSTOMER" | null;
    }>;
}
