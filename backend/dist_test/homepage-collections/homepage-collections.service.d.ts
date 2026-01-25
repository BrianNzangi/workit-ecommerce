import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '@workit/db';
export declare class HomepageCollectionsService {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    getHomepageCollections(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        sortOrder: number;
        enabled: boolean;
    }[]>;
    getHomepageCollection(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        sortOrder: number;
        enabled: boolean;
    }>;
    createHomepageCollection(input: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        sortOrder: number;
        enabled: boolean;
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
        title: string;
        slug: string;
        sortOrder: number;
        enabled: boolean;
    }>;
}
