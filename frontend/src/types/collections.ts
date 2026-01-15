/**
 * Shared Types for Collections API
 * 
 * These types match the backend Collections API structure
 */

/**
 * Asset (Image) from ImageKit
 */
export interface Asset {
    id: string;
    name: string;
    source: string;      // Full image URL
    preview: string;     // Thumbnail URL
    width: number;
    height: number;
}

/**
 * Collection from the Collections API
 */
export interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    enabled: boolean;
    showInMostShopped: boolean;
    sortOrder: number;
    assetId: string | null;
    createdAt: string;
    updatedAt: string;

    // Relations (when included)
    asset?: Asset | null;
    parent?: Collection | null;
    children?: Collection[];
}

/**
 * Simplified collection for frontend display
 */
export interface CollectionDisplay {
    id: string;
    name: string;
    slug: string;
    image?: string;
    children?: CollectionDisplay[];
}

/**
 * API Response types
 */
export interface CollectionsResponse {
    collections: Collection[];
    total?: number;
}

export interface CollectionResponse {
    collection: Collection;
}

/**
 * Query parameters for fetching collections
 */
export interface CollectionsQueryParams {
    parentId?: string | 'null';
    includeChildren?: boolean;
    includeAssets?: boolean;
    take?: number;
    skip?: number;
}
