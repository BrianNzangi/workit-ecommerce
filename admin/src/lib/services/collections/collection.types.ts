export interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    enabled: boolean;
    featured: boolean;
    parentId: string | null;
    assetId: string | null;
    createdAt: string;
    updatedAt: string;
    asset?: any;
    parent?: any;
    children?: any[];
}

export interface CreateCollectionInput {
    name: string;
    slug: string;
    description?: string;
    enabled?: boolean;
    featured?: boolean;
    parentId?: string;
    assetId?: string;
}

export interface CollectionListOptions {
    take?: number;
    skip?: number;
    parentId?: string;
    includeChildren?: boolean | string;
}
