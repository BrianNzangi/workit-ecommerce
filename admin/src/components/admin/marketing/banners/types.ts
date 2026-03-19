import { Asset } from '@/lib/services';

export type BannerFormMode = 'create' | 'edit';

export interface BannerFormData {
    name: string;
    description: string;
    slug: string;
    position: string;
    collectionId: string;
    productId: string;
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

export interface BannerAssetSelection {
    desktop: Asset | null;
    mobile: Asset | null;
}
