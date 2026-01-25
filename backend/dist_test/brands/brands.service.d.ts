import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@workit/db';
export declare class BrandsService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    getBrands(): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        enabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getBrand(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        enabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createBrand(input: any): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        enabled: boolean;
        logoUrl: string | null;
    }>;
    updateBrand(id: string, input: any): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        enabled: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteBrand(id: string): Promise<void>;
}
