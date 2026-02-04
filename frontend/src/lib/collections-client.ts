/**
 * Collections Service (Client-Side)
 * 
 * Client-side functions for fetching collections through Next.js API routes.
 * These functions can be used in Client Components.
 */

import { Collection, CollectionsQueryParams, CollectionDisplay } from '@/types/collections';

/**
 * Fetch collections from the frontend API route (Client-Side)
 * 
 * @param params - Query parameters for filtering collections
 * @returns Promise<Collection[]>
 */
export async function fetchCollectionsClient(
    params: CollectionsQueryParams = {}
): Promise<Collection[]> {
    const { parentId, includeChildren = false, take = 50, skip = 0 } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    if (parentId !== undefined) queryParams.set('parentId', parentId);
    if (includeChildren) queryParams.set('includeChildren', 'true');
    if (take) queryParams.set('take', take.toString());
    if (skip) queryParams.set('skip', skip.toString());

    const url = `/api/collections?${queryParams.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
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
 * Fetch hierarchical collections for navigation (Client-Side)
 * 
 * @returns Promise<Collection[]>
 */
export async function fetchNavigationCollectionsClient(): Promise<Collection[]> {
    return fetchCollectionsClient({
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
        sortOrder: collection.sortOrder,
        image: collection.asset?.preview || collection.asset?.source,
        children: collection.children
            ?.filter(child => child.enabled)
            .map(transformCollectionForDisplay),
    };
}

/**
 * Fetch and transform collections for navigation (Client-Side)
 * Returns only enabled collections with simplified structure
 * 
 * @returns Promise<CollectionDisplay[]>
 */
export async function fetchNavigationCollectionsDisplayClient(): Promise<CollectionDisplay[]> {
    try {
        const collections = await fetchNavigationCollectionsClient();

        if (!Array.isArray(collections)) {
            console.error('fetchNavigationCollectionsClient returned non-array:', collections);
            return [];
        }

        // Filter only enabled collections and transform
        return collections
            .filter(collection => collection?.enabled)
            .map(transformCollectionForDisplay);
    } catch (error) {
        console.error('Error fetching navigation collections:', error);
        return [];
    }
}
