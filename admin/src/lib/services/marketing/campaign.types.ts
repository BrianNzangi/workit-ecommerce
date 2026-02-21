export interface CampaignFeaturedProduct {
    id: string;
    name: string;
    slug: string;
    sku?: string | null;
    salePrice?: number | null;
    originalPrice?: number | null;
    enabled?: boolean;
    assets?: any[];
    collections?: Array<{ collection?: { id: string; name: string; slug: string } }>;
    brand?: any;
}

export interface Campaign {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    status: string;
    startDate: string;
    endDate: string | null;
    discountType: string | null;
    discountValue: number | null;
    couponCode: string | null;
    minPurchaseAmount: number | null;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
    usagePerCustomer: number | null;
    targetAudience: string | null;
    bannerIds: string[];
    collectionIds: string[];
    productIds: string[];
    featuredProducts?: CampaignFeaturedProduct[];
    featuredProductsCount?: number;
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    conversions: number;
    revenue: number;
    brevoEmailCampaignId?: number | null;
    brevoListId?: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCampaignInput {
    name: string;
    slug: string;
    description?: string;
    type: string;
    status: string;
    startDate: string;
    endDate?: string;
    targetAudience?: string;
    discountType?: string;
    discountValue?: number;
    couponCode?: string;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usagePerCustomer?: number;
    bannerIds?: string[];
    collectionIds?: string[];
    productIds?: string[];
    brevoEmailCampaignId?: number;
    brevoListId?: number;
}

export interface CampaignListOptions {
    status?: string;
    type?: string;
    q?: string;
}

export interface CampaignProductOptionsInput {
    q?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
    selectedIds?: string[];
}

export interface SendCampaignInput {
    channel?: "EMAIL" | "SMS" | "PUSH" | string;
    scheduledAt?: string;
    brevoEmailCampaignId?: number;
    brevoListId?: number;
}

export interface CampaignSendPayload {
    campaignId: string;
    name: string;
    slug: string;
    status: string;
    type: string;
    targetAudience: string | null;
    schedule: {
        startDate: string | null;
        endDate: string | null;
    };
    discount: {
        type: string | null;
        value: number | null;
        couponCode: string | null;
        minPurchaseAmount: number | null;
        maxDiscountAmount: number | null;
    };
    featuredProducts: Array<{
        id: string;
        name: string;
        slug: string;
        sku?: string | null;
        salePrice?: number | null;
        originalPrice?: number | null;
    }>;
}
