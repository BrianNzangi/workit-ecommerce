/**
 * Collections Service (Server-Side)
 * 
 * Server-side functions for fetching collections from the backend API.
 * These functions should only be used in Server Components or API routes.
 */

import { Collection, CollectionsQueryParams, CollectionDisplay } from '@/types/collections';

import { proxyFetch } from './proxy-utils';

/**
 * Fetch collections from the backend API (Server-Side)
 * 
 * @param params - Query parameters for filtering collections
 * @returns Promise<Collection[]>
 */
export async function fetchCollections(
    params: CollectionsQueryParams = {}
): Promise<Collection[]> {
    const { parentId, includeChildren = false, includeAssets = true, take = 50, skip = 0 } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    if (parentId !== undefined) queryParams.set('parentId', parentId);
    if (includeChildren) queryParams.set('includeChildren', 'true');
    if (includeAssets) queryParams.set('includeAssets', 'true');
    if (take) queryParams.set('take', take.toString());
    if (skip) queryParams.set('skip', skip.toString());

    try {
        const response = await proxyFetch(`/store/collections?${queryParams.toString()}`, {
            // Revalidate every 5 minutes
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch collections: ${response.status} ${response.statusText}`);
        }

        const collections: Collection[] = await response.json();
        return collections;
    } catch (error) {
        console.error('Error fetching collections:', error);
        throw error;
    }
}

/**
 * Fetch a single collection by ID (Server-Side)
 * 
 * @param id - Collection ID
 * @returns Promise<Collection>
 */
export async function fetchCollectionById(id: string): Promise<Collection> {
    try {
        const response = await proxyFetch(`/store/collections/${id}`, {
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch collection: ${response.status} ${response.statusText}`);
        }

        const collection: Collection = await response.json();
        return collection;
    } catch (error) {
        console.error('Error fetching collection:', error);
        throw error;
    }
}

/**
 * Fetch hierarchical collections (Level 1 with children) for navigation
 * 
 * @returns Promise<Collection[]>
 */
export async function fetchNavigationCollections(): Promise<Collection[]> {
    return fetchCollections({
        parentId: 'null',
        includeChildren: true,
    });
}

/**
 * Transform Collection to CollectionDisplay (simplified for frontend)
 * 
 * @param collection - Full collection object
 * @returns CollectionDisplay
 */
export function transformCollectionForDisplay(collection: Collection): CollectionDisplay {
    return {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        image: collection.asset?.preview || collection.asset?.source,
        children: collection.children
            ?.filter(child => child.enabled)
            .map(transformCollectionForDisplay),
    };
}

/**
 * Fetch and transform collections for navigation (Server-Side)
 * Returns only enabled collections with simplified structure
 * 
 * @returns Promise<CollectionDisplay[]>
 */
export async function fetchNavigationCollectionsDisplay(): Promise<CollectionDisplay[]> {
    try {
        const collections = await fetchNavigationCollections();

        // Filter only enabled collections and transform
        return collections
            .filter(collection => collection.enabled)
            .map(transformCollectionForDisplay);
    } catch (error) {
        console.error('Error fetching navigation collections:', error);
        return [];
    }
}
