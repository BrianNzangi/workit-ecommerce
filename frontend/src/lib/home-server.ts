import { fetchCollections } from './collections-server';
import { proxyFetch } from './proxy-utils';
import { normalizeProducts } from './product-normalization';
import { HomepageCollectionData } from '@/hooks/useHomepageCollections';

/**
 * Fetch data for "Most Shopped" section on the server
 */
export async function getMostShoppedCollections() {
    try {
        const data = await fetchCollections({
            parentId: 'null',
            includeChildren: true,
            take: 100,
        });

        const allFeaturedCollections: any[] = [];
        const addedIds = new Set<string>();

        const findFeaturedRecursively = (items: any[]) => {
            items.forEach((item: any) => {
                if (item.showInMostShopped === true && !addedIds.has(item.id)) {
                    allFeaturedCollections.push({
                        id: item.id,
                        name: item.name,
                        slug: item.slug,
                        mostShoppedSortOrder: item.mostShoppedSortOrder || 0,
                        image: item.asset?.preview || item.asset?.source,
                    });
                    addedIds.add(item.id);
                }

                if (item.children && item.children.length > 0) {
                    findFeaturedRecursively(item.children);
                }
            });
        };

        findFeaturedRecursively(data);

        // Sort by mostShoppedSortOrder
        return allFeaturedCollections.sort((a, b) => a.mostShoppedSortOrder - b.mostShoppedSortOrder);
    } catch (err) {
        console.error('Error fetching most shopped collections:', err);
        return [];
    }
}

/**
 * Fetch homepage collections (Featured Sections) on the server
 */
export async function getHomepageCollections(): Promise<HomepageCollectionData[]> {
    try {
        const response = await proxyFetch(`/store/homepage-collections?status=active`, {
            method: 'GET',
            next: { revalidate: 60 }, // Cache for 60 seconds
        });

        if (!response.ok) return [];

        const data = await response.json();
        const homepageCollections = data.collections || (Array.isArray(data) ? data : []);

        const transformed = homepageCollections.map((collection: any) => {
            const products = (collection.products || []).map((p: any) => p.product).filter(Boolean);
            return {
                ...collection,
                products: normalizeProducts(products)
            };
        });

        return transformed.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title));
    } catch (err) {
        console.error('Error fetching homepage collections on server:', err);
        return [];
    }
}

/**
 * Fetch banners by position on the server
 */
export async function getBanners(position: string) {
    try {
        const response = await proxyFetch(`/store/banners?position=${position}&enabled=true`, {
            method: 'GET',
            next: { revalidate: 60 },
        });

        if (!response.ok) return [];

        const data = await response.json();

        if (data && Array.isArray(data)) {
            return data
                .filter((banner: any) => banner.position === position && banner.enabled)
                .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
        }

        return [];
    } catch (err) {
        console.error(`Error fetching ${position} banners on server:`, err);
        return [];
    }
}
