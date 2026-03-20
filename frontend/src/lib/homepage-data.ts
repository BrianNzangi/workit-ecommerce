import { proxyFetch } from '@/lib/proxy-utils';
import { normalizeProducts } from '@/lib/product-normalization';
import { getImageUrl } from '@/lib/image-utils';
import { Blog } from '@/types/blog';
import { Collection } from '@/types/collections';
import type { ProductPromotion, ProductCampaign } from '@/types/product';
import { Variant } from '@/types/variant';
import type { StoreBanner } from '@/lib/banner-target';

export interface HomepageProduct {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    condition?: 'NEW' | 'REFURBISHED';
    images: Array<{
        id: string;
        url: string;
        altText?: string;
        position?: number;
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
    variantId?: string;
    variants?: Variant[];
    stockOnHand?: number;
    canBuy?: boolean;
    campaigns?: ProductCampaign[];
    activePromotion?: ProductPromotion | null;
}

export interface HomepageCollectionData {
    id: string;
    title: string;
    slug: string;
    subtitle?: string;
    description?: string;
    sortOrder: number;
    products: HomepageProduct[];
    createdAt: string;
    updatedAt: string;
}

export interface MostShoppedCollection {
    id: string;
    name: string;
    slug: string;
    mostShoppedSortOrder: number;
    image?: string;
}

interface BackendBlog {
    id: string;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string | null;
    publishedAt?: string | null;
    createdAt?: string;
    asset?: {
        source?: string;
        preview?: string;
    } | null;
}

function mapBackendBlogToFrontend(blog: BackendBlog): Blog {
    const imagePath = blog.asset?.preview || blog.asset?.source || '/placeholder-blog.svg';
    const date = blog.publishedAt || blog.createdAt || new Date().toISOString();

    return {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        link: `/blog/${blog.slug}`,
        category: 'Workit Blog',
        categories: ['Workit Blog'],
        image: getImageUrl(imagePath),
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        date,
    };
}

function sortBanners(banners: StoreBanner[], position?: string) {
    return banners
        .filter((banner) => banner.enabled && (!position || banner.position === position))
        .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getHomepageBanners(): Promise<Record<string, StoreBanner[]>> {
    const response = await proxyFetch('/store/banners?enabled=true', {
        method: 'GET',
        cache: 'force-cache',
        next: { revalidate: 300 },
        useRequestContext: false,
    });

    if (!response.ok) {
        return {
            HERO: [],
            DEALS: [],
            DEALS_HORIZONTAL: [],
            MIDDLE: [],
            BOTTOM: [],
        };
    }

    const data = await response.json();
    const banners = Array.isArray(data) ? data : (data.banners || []);

    return {
        HERO: sortBanners(banners, 'HERO'),
        DEALS: sortBanners(banners, 'DEALS'),
        DEALS_HORIZONTAL: sortBanners(banners, 'DEALS_HORIZONTAL'),
        MIDDLE: sortBanners(banners, 'MIDDLE'),
        BOTTOM: sortBanners(banners, 'BOTTOM'),
    };
}

export async function getStoreBanners(
    position?: string,
    options: { collectionSlug?: string; campaignSlug?: string } = {},
): Promise<StoreBanner[]> {
    const params = new URLSearchParams();

    if (position) {
        params.set('position', position);
    }

    if (options.collectionSlug) {
        params.set('collection', options.collectionSlug);
    }

    if (options.campaignSlug) {
        params.set('campaign', options.campaignSlug);
    }

    params.set('enabled', 'true');

    const response = await proxyFetch(`/store/banners?${params.toString()}`, {
        method: 'GET',
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    const banners = Array.isArray(data) ? data : (data.banners || []);

    return sortBanners(banners, position);
}

export async function getFirstBanner(
    position: string,
    options: { collectionSlug?: string; campaignSlug?: string } = {},
): Promise<StoreBanner | null> {
    const banners = await getStoreBanners(position, options);
    return banners[0] || null;
}

export async function getFeaturedBlogs(): Promise<Blog[]> {
    const response = await proxyFetch('/marketing/blog?limit=50&offset=0', {
        method: 'GET',
        next: { revalidate: 120 },
    });

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    const blogs: BackendBlog[] = Array.isArray(data) ? data : (data.blogs || []);
    const transformed = blogs.map(mapBackendBlogToFrontend);
    const sorted = transformed.sort(
        (a: Blog, b: Blog) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
    );
    const featured = sorted.filter((blog: Blog) =>
        (blog.categories || []).some((category: string) =>
            category.replace(/[\s-_]/g, '').toLowerCase().includes('featured')
        )
    );

    return (featured.length > 0 ? featured : sorted).slice(0, 15);
}

export async function getMostShoppedCollections(): Promise<MostShoppedCollection[]> {
    const params = new URLSearchParams({
        parentId: 'null',
        includeChildren: 'true',
        includeAssets: 'true',
        take: '100',
        skip: '0',
    });

    const response = await proxyFetch(`/store/collections?${params.toString()}`, {
        method: 'GET',
        next: { revalidate: 120 },
    });

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    const collections: Collection[] = Array.isArray(data) ? data : (data.collections || []);
    const featuredCollections: MostShoppedCollection[] = [];
    const addedIds = new Set<string>();

    const findFeaturedRecursively = (items: Collection[]) => {
        items.forEach((item) => {
            if (item.showInMostShopped === true && !addedIds.has(item.id)) {
                featuredCollections.push({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    mostShoppedSortOrder: item.mostShoppedSortOrder || 0,
                    image: item.asset?.preview || item.asset?.source,
                });
                addedIds.add(item.id);
            }

            if (item.children?.length) {
                findFeaturedRecursively(item.children);
            }
        });
    };

    findFeaturedRecursively(collections);

    return featuredCollections.sort(
        (a, b) => a.mostShoppedSortOrder - b.mostShoppedSortOrder
    );
}

export async function getHomepageCollections(
    options: { status?: 'active' | 'draft' | 'archived'; limit?: number } = {}
): Promise<HomepageCollectionData[]> {
    const params = new URLSearchParams();
    params.set('status', options.status || 'active');

    if (options.limit) {
        params.set('limit', String(options.limit));
    }

    const response = await proxyFetch(`/store/homepage-collections?${params.toString()}`, {
        method: 'GET',
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    const homepageCollections = data.collections || (Array.isArray(data) ? data : []);

    return homepageCollections.map((collection: any) => ({
        ...collection,
        products: normalizeProducts(
            (collection.products || []).map((product: any) => product?.product || product).filter(Boolean)
        ).slice(0, 12),
    }));
}
