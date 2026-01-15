/**
 * useHomepageCollections Hook
 * 
 * Client-side hook for fetching homepage collections from the API.
 * This follows the Storefront Integration Guide patterns.
 */

import { useState, useEffect } from 'react';

/**
 * Product interface matching the backend API response
 */
export interface HomepageProduct {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    condition?: string;
    images: Array<{
        id?: string;
        url: string;
        altText?: string;
    }>;
    brand?: {
        id: string;
        name: string;
        slug: string;
    };
    shippingMethod?: {
        id: string;
        code: string;
        name: string;
        description?: string;
        isExpress: boolean;
    };
}

/**
 * Homepage Collection interface matching the backend API response
 */
export interface HomepageCollectionData {
    id: string;
    title: string;
    slug: string;
    subtitle?: string;
    description?: string;
    position: number;
    status: 'active' | 'draft' | 'archived';
    products: HomepageProduct[];
    createdAt: string;
    updatedAt: string;
}

/**
 * API Response interface
 */
interface HomepageCollectionsResponse {
    success: boolean;
    data: {
        homepageCollections: HomepageCollectionData[];
    };
    error?: {
        code: string;
        message: string;
    };
}

/**
 * Hook options
 */
interface UseHomepageCollectionsOptions {
    status?: 'active' | 'draft' | 'archived';
    limit?: number;
}

/**
 * Hook return type
 */
interface UseHomepageCollectionsReturn {
    collections: HomepageCollectionData[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Fetch homepage collections from the API
 */
async function fetchHomepageCollections(
    options: UseHomepageCollectionsOptions = {}
): Promise<HomepageCollectionData[]> {
    const { status = 'active', limit } = options;

    const params = new URLSearchParams();
    params.append('status', status);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`/api/home-collection?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: HomepageCollectionsResponse = await response.json();

    if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch homepage collections');
    }

    return result.data.homepageCollections;
}

/**
 * React hook for fetching homepage collections
 * 
 * @param options - Options for filtering collections
 * @returns Collections data, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * const { collections, loading, error } = useHomepageCollections({ status: 'active' });
 * ```
 */
export function useHomepageCollections(
    options: UseHomepageCollectionsOptions = {}
): UseHomepageCollectionsReturn {
    const [collections, setCollections] = useState<HomepageCollectionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadCollections = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchHomepageCollections(options);

            // Sort by position
            const sorted = data.sort((a, b) => a.position - b.position);
            setCollections(sorted);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading homepage collections:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCollections();
    }, [JSON.stringify(options)]);

    return {
        collections,
        loading,
        error,
        refetch: loadCollections,
    };
}
