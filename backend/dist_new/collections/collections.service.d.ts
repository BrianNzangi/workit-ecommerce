import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@workit/db';
export declare class CollectionsService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    getCollections(parentId?: string, includeChildren?: boolean): Promise<any[]>;
    getCollection(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        parentId: string | null;
        enabled: boolean;
        showInMostShopped: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        assetId: string | null;
    }>;
    createCollection(input: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        enabled: boolean;
        assetId: string | null;
        sortOrder: number;
        parentId: string | null;
        showInMostShopped: boolean;
    }>;
    updateCollection(id: string, input: any): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        parentId: string | null;
        enabled: boolean;
        showInMostShopped: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        assetId: string | null;
    }>;
    deleteCollection(id: string): Promise<void>;
}
