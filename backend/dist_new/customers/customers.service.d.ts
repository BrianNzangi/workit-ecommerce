import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
export declare class CustomersService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    findAll(): Promise<{
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: "ADMIN" | "CUSTOMER" | null;
        firstName: string | null;
        lastName: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: "ADMIN" | "CUSTOMER" | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    create(input: any): Promise<{
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: "ADMIN" | "CUSTOMER" | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    update(id: string, input: any): Promise<{
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: "ADMIN" | "CUSTOMER" | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
