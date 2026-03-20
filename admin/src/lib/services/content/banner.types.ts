import { banners } from '@workit/api';

export type Banner = banners.Banner & {
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
};

export type CreateBannerInput = banners.CreateBannerInput & {
    name: string;
    slug: string;
    description?: string;
    enabled?: boolean;
    position?: string;
    sortOrder?: number;
    desktopImageId?: string;
    mobileImageId?: string;
    collectionId?: string;
    productId?: string;
    campaignId?: string;
};

export interface BannerListOptions {
    take?: number;
    skip?: number;
    position?: string;
    enabled?: boolean;
}
