import { useQuery } from '@tanstack/react-query';
import type { HomepageCollectionData } from '@/lib/homepage/homepage-data';

interface CollectionResponse {
    success: boolean;
    data: {
        collection: HomepageCollectionData;
    };
    error?: {
        code: string;
        message: string;
    };
}

async function fetchCollectionBySlug(slug: string): Promise<HomepageCollectionData | null> {
    const res = await fetch(`/api/home-collection/${slug}`, {
        cache: 'no-store',
    });

    if (res.status === 404) {
        return null;
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch collection: ${res.status}`);
    }

    const result: CollectionResponse = await res.json();

    if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch collection');
    }

    return result.data.collection;
}

export function useCollectionBySlug(slug: string, enabled: boolean) {
    return useQuery({
        queryKey: ['homepage', slug],
        queryFn: () => fetchCollectionBySlug(slug),
        enabled,
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
    });
}
