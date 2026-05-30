import { Asset } from '@/lib/services';

export type BannerFormMode = 'create' | 'edit';

export interface BannerFormData {
    title: string;
    description: string;
    slug: string;
    position: string;
    collectionId: string;
    productId: string;
    campaignId: string;
    promotionId: string;
    enabled: boolean;
    sortOrder: number;
    desktopImageId: string;
    mobileImageId: string;
}

export interface BannerLinkedProduct {
    id: string;
    name: string;
    slug: string;
    sku?: string | null;
}

export interface BannerLinkedCampaign {
    id: string;
    name: string;
    slug: string;
    status?: string | null;
}

export interface BannerLinkedPromotion {
    id: string;
    title: string;
    type: 'coupon' | 'flash_sale' | 'featured_deal' | 'clearance_deal';
}

export interface BannerAssetSelection {
    desktop: Asset | null;
    mobile: Asset | null;
}
