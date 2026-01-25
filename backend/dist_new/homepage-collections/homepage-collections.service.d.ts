import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '@workit/db';
export declare class HomepageCollectionsService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    getHomepageCollections(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        enabled: boolean;
        title: string;
        sortOrder: number;
    }[]>;
    getHomepageCollection(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        enabled: boolean;
        title: string;
        sortOrder: number;
    }>;
    createHomepageCollection(input: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        enabled: boolean;
        title: string;
        sortOrder: number;
    }>;
    updateHomepageCollection(id: string, input: any): Promise<{
        id: string;
        title: string;
        slug: string;
        enabled: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteHomepageCollection(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        enabled: boolean;
        title: string;
        sortOrder: number;
    }>;
}
