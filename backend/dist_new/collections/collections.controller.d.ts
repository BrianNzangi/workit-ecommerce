import { CollectionsService } from './collections.service';
export declare class CollectionsController {
    private collectionsService;
    constructor(collectionsService: CollectionsService);
    getCollections(parentId?: string, includeChildren?: string): Promise<any[]>;
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
    deleteCollection(id: string): Promise<{
        success: boolean;
    }>;
}
