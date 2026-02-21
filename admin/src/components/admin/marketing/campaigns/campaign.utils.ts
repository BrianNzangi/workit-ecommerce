import { Campaign } from '@/lib/services';
import { CampaignFormData } from './types';

export const createInitialCampaignFormData = (): CampaignFormData => ({
    name: '',
    slug: '',
    description: '',
    type: 'SEASONAL',
    status: 'DRAFT',
    startDate: '',
    endDate: '',
    targetAudience: '',
    discountType: 'NONE',
    discountValue: 0,
    couponCode: '',
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    usagePerCustomer: 1,
    bannerIds: [],
    collectionIds: [],
    productIds: [],
});

export const generateSlug = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

export const parseDateTimeLocal = (dateValue?: string | null) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
};

export const toKesMinorUnits = (value: number) => Math.round((Number(value) || 0) * 100);

export const fromKesMinorUnits = (value?: number | null) => {
    if (value === null || value === undefined) return 0;
    return Number(value) / 100;
};

export const formatKes = (value?: number | null) =>
    `KES ${Number(value || 0).toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

export const formatKesMinor = (minor?: number | null) => formatKes(fromKesMinorUnits(minor));

export const toCampaignFormData = (campaign: Campaign): CampaignFormData => ({
    name: campaign.name || '',
    slug: campaign.slug || '',
    description: campaign.description || '',
    type: campaign.type || 'SEASONAL',
    status: campaign.status || 'DRAFT',
    startDate: parseDateTimeLocal(campaign.startDate),
    endDate: parseDateTimeLocal(campaign.endDate),
    targetAudience: campaign.targetAudience || '',
    discountType: campaign.discountType || 'NONE',
    discountValue: campaign.discountType === 'PERCENTAGE'
        ? Number(campaign.discountValue || 0)
        : fromKesMinorUnits(campaign.discountValue),
    couponCode: campaign.couponCode || '',
    minPurchaseAmount: fromKesMinorUnits(campaign.minPurchaseAmount),
    maxDiscountAmount: fromKesMinorUnits(campaign.maxDiscountAmount),
    usageLimit: Number(campaign.usageLimit || 0),
    usagePerCustomer: Number(campaign.usagePerCustomer || 1),
    bannerIds: campaign.bannerIds || [],
    collectionIds: campaign.collectionIds || [],
    productIds: campaign.productIds || [],
});
