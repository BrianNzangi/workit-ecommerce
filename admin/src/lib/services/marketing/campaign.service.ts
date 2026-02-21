import { BaseService } from '../base/base.service';
import {
    Campaign,
    CreateCampaignInput,
    CampaignListOptions,
    CampaignProductOptionsInput,
    CampaignFeaturedProduct,
    CampaignSendPayload,
    SendCampaignInput,
} from './campaign.types';
import { validationError } from '@/lib/graphql/errors';

const parseIdArray = (value: string[] | string | null | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);

    const raw = String(value).trim();
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        // Ignore and fallback to comma-separated format.
    }

    return raw.split(',').map((item) => item.trim()).filter(Boolean);
};

const normalizeCampaign = (payload: any): Campaign => {
    const campaign = (payload?.campaign || payload) as any;

    return {
        ...campaign,
        bannerIds: parseIdArray(campaign?.bannerIds),
        collectionIds: parseIdArray(campaign?.collectionIds),
        productIds: parseIdArray(campaign?.productIds),
        featuredProducts: (campaign?.featuredProducts || []) as CampaignFeaturedProduct[],
        featuredProductsCount: Number(campaign?.featuredProductsCount ?? parseIdArray(campaign?.productIds).length),
        emailsSent: Number(campaign?.emailsSent || 0),
        emailsOpened: Number(campaign?.emailsOpened || 0),
        emailsClicked: Number(campaign?.emailsClicked || 0),
        conversions: Number(campaign?.conversions || 0),
        revenue: Number(campaign?.revenue || 0),
    };
};

export class CampaignService extends BaseService {
    /**
     * Get all campaigns
     */
    async getCampaigns(options: CampaignListOptions = {}): Promise<Campaign[]> {
        try {
            if (options.q) {
                const response = await this.adminClient.campaigns.search({ q: options.q });
                return (response?.campaigns || []).map(normalizeCampaign);
            }

            const response = await this.adminClient.campaigns.list(options);
            return (response?.campaigns || []).map(normalizeCampaign);
        } catch (error: any) {
            console.error('Error in getCampaigns:', error);
            return [];
        }
    }

    /**
     * Get a single campaign by ID
     */
    async getCampaign(id: string): Promise<Campaign | null> {
        try {
            const response = await this.adminClient.campaigns.get(id);
            return normalizeCampaign(response);
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw validationError(error.message || 'Failed to fetch campaign');
        }
    }

    /**
     * Search/fetch products for campaign featured products
     */
    async getCampaignProductOptions(options: CampaignProductOptionsInput = {}): Promise<CampaignFeaturedProduct[]> {
        try {
            const response = await this.adminClient.campaigns.products(options);
            return response?.products || [];
        } catch (error: any) {
            console.error('Error in getCampaignProductOptions:', error);
            return [];
        }
    }

    /**
     * Fetch campaign send payload for external delivery integrations
     */
    async getCampaignSendPayload(id: string): Promise<{ campaign: Campaign; payload: CampaignSendPayload }> {
        try {
            const response = await this.adminClient.campaigns.getSendPayload(id);
            return {
                campaign: normalizeCampaign(response?.campaign),
                payload: response?.payload as CampaignSendPayload,
            };
        } catch (error: any) {
            throw validationError(error.message || 'Failed to fetch campaign send payload');
        }
    }

    /**
     * Mark/send campaign through backend send endpoint
     */
    async sendCampaign(id: string, input: SendCampaignInput = {}): Promise<{ campaign: Campaign; dispatch: any }> {
        try {
            const response = await this.adminClient.campaigns.send(id, input);
            return {
                campaign: normalizeCampaign(response?.campaign),
                dispatch: response?.dispatch,
            };
        } catch (error: any) {
            throw validationError(error.message || 'Failed to send campaign');
        }
    }

    /**
     * Create a new campaign
     */
    async createCampaign(data: CreateCampaignInput): Promise<Campaign> {
        try {
            const response = await this.adminClient.campaigns.create(data);
            return normalizeCampaign(response);
        } catch (error: any) {
            throw validationError(error.message || 'Failed to create campaign');
        }
    }

    /**
     * Update an existing campaign
     */
    async updateCampaign(id: string, data: Partial<CreateCampaignInput>): Promise<Campaign> {
        try {
            const response = await this.adminClient.campaigns.update(id, data);
            return normalizeCampaign(response);
        } catch (error: any) {
            throw validationError(error.message || 'Failed to update campaign');
        }
    }

    /**
     * Delete a campaign
     */
    async deleteCampaign(id: string): Promise<boolean> {
        try {
            await this.adminClient.campaigns.delete(id);
            return true;
        } catch (error: any) {
            throw validationError(error.message || 'Failed to delete campaign');
        }
    }

    /**
     * Bulk delete campaigns
     */
    async bulkDelete(ids: string[]): Promise<boolean> {
        try {
            await this.adminClient.campaigns.bulkDelete({ ids });
            return true;
        } catch (error: any) {
            throw validationError(error.message || 'Failed to bulk delete campaigns');
        }
    }
}
