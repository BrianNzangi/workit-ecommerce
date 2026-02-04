import { BaseService } from '../base/base.service';
import { Campaign, CreateCampaignInput, CampaignListOptions } from './campaign.types';
import {
    validationError,
    notFoundError,
    duplicateError,
} from '@/lib/graphql/errors';

export class CampaignService extends BaseService {
    /**
     * Get all campaigns
     */
    async getCampaigns(options: CampaignListOptions = {}): Promise<Campaign[]> {
        try {
            // Check if search query is provided
            if (options.q) {
                const response = await this.adminClient.campaigns.search(options as any);
                return response.campaigns || [];
            }

            const response = await this.adminClient.campaigns.list(options);
            return response.campaigns || [];
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
            return await this.adminClient.campaigns.get(id);
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw validationError(error.message || 'Failed to fetch campaign');
        }
    }

    /**
     * Create a new campaign
     */
    async createCampaign(data: CreateCampaignInput): Promise<Campaign> {
        try {
            return await this.adminClient.campaigns.create(data);
        } catch (error: any) {
            throw validationError(error.message || 'Failed to create campaign');
        }
    }

    /**
     * Update an existing campaign
     */
    async updateCampaign(id: string, data: Partial<CreateCampaignInput>): Promise<Campaign> {
        try {
            return await this.adminClient.campaigns.update(id, data);
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
