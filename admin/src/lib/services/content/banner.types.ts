export type Banner = {
    id: string;
    linkUrl: string | null;
    createdAt: string;
    updatedAt: string;
    name: string;
    slug: string;
    description?: string;
    enabled: boolean;
    position: string;
    sortOrder: number;
    desktopImage?: any;
    mobileImage?: any;
    collection?: any;
    product?: any;
    campaign?: any;
    desktopImageId?: string;
    mobileImageId?: string;
    collectionId?: string;
    productId?: string;
    campaignId?: string;
    promotionId?: string;
};

export type CreateBannerInput = {
    name: string;
    slug: string;
    description?: string | null;
    enabled?: boolean;
    position?: string;
    sortOrder?: number;
    desktopImageId?: string | null;
    mobileImageId?: string | null;
    collectionId?: string | null;
    productId?: string | null;
    campaignId?: string | null;
    promotionId?: string | null;
};

export interface BannerListOptions {
    take?: number;
    skip?: number;
    position?: string;
    enabled?: boolean;
}
