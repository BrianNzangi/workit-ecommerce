import { Campaign, CampaignFeaturedProduct } from '@/lib/services';

export interface CampaignFormData {
    name: string;
    slug: string;
    description: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    targetAudience: string;
    discountType: string;
    discountValue: number;
    couponCode: string;
    minPurchaseAmount: number;
    maxDiscountAmount: number;
    usageLimit: number;
    usagePerCustomer: number;
    bannerIds: string[];
    collectionIds: string[];
    productIds: string[];
}

export type CampaignFormMode = 'create' | 'edit';

export interface CampaignFormProps {
    mode?: CampaignFormMode;
    campaignId?: string;
}

export interface CampaignsListProps {
    initialStatusFilter?: string;
}

export interface CampaignWithFeaturedProducts extends Campaign {
    featuredProducts: CampaignFeaturedProduct[];
}
