export interface BannerImage {
    id?: string;
    source?: string;
    preview?: string;
}

export interface StoreBanner {
    id: string;
    title: string;
    description?: string;
    slug: string;
    position: string;
    enabled: boolean;
    sortOrder: number;
    desktopImage?: BannerImage;
    mobileImage?: BannerImage;
    collection?: {
        id: string;
        name: string;
        slug: string;
    };
    product?: {
        id: string;
        name: string;
        slug: string;
    };
}

export function getBannerHref(banner?: StoreBanner | null): string | null {
    if (!banner) {
        return null;
    }

    if (banner.product?.slug) {
        return `/deal-details/${banner.product.slug}`;
    }

    if (banner.collection?.slug) {
        return `/collections/${banner.collection.slug}`;
    }

    return null;
}
