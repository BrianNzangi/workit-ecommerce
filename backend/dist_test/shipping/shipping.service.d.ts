import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
export declare class ShippingService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    findAllMethods(): Promise<{
        zones: {
            cities: {
                id: string;
                zoneId: string;
                cityTown: string;
                standardPrice: number;
                expressPrice: number | null;
            }[];
            id: string;
            shippingMethodId: string;
            county: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        code: string;
        name: string;
        description: string | null;
        enabled: boolean;
        isExpress: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createZone(input: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        shippingMethodId: string;
        county: string;
    }>;
    updateZone(id: string, input: any): Promise<{
        id: string;
        shippingMethodId: string;
        county: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteZone(id: string): Promise<{
        success: boolean;
    }>;
}
