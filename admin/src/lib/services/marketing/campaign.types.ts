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
    bannerIds: string | null;
    collectionIds: string | null;
    productIds: string | null;
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
    conversions: number;
    revenue: number;
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
}

export interface CampaignListOptions {
    status?: string;
    type?: string;
    q?: string;
}
