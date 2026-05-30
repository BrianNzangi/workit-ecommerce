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
    campaign?: {
        id: string;
        name: string;
        slug: string;
    };
    promotion?: {
        id: string;
        title: string;
        type: string;
    };
}

export function getBannerHref(banner?: StoreBanner | null): string | null {
    if (!banner) {
        return null;
    }

    if (banner.product?.slug) {
        return `/deal-details/${banner.product.slug}`;
    }

    if (banner.campaign?.slug) {
        return `/shop/collections/${banner.campaign.slug}`;
    }

    if (banner.collection?.slug) {
        return `/shop/collections/${banner.collection.slug}`;
    }

    if (banner.promotion) {
        return `/`;
    }

    return null;
}
