import { Asset } from '@/lib/services';

export type BannerFormMode = 'create' | 'edit';

export interface BannerFormData {
    name: string;
    description: string;
    slug: string;
    position: string;
    collectionId: string;
    enabled: boolean;
    sortOrder: number;
    desktopImageId: string;
    mobileImageId: string;
}

export interface BannerAssetSelection {
    desktop: Asset | null;
    mobile: Asset | null;
}
