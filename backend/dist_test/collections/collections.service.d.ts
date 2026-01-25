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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        assetId: string | null;
        sortOrder: number;
        description: string | null;
        enabled: boolean;
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
