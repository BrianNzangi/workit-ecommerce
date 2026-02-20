import { BaseService } from '../base/base.service';
import { Banner, CreateBannerInput, BannerListOptions } from './banner.types';

function normalizeBannerResponse(payload: any): Banner {
    return (payload?.banner || payload) as Banner;
}

function normalizeBannerListResponse(payload: any): Banner[] {
    return Array.isArray(payload) ? payload : (payload?.banners || []);
}

export class BannerService extends BaseService {
    async createBanner(input: CreateBannerInput): Promise<Banner> {
        const response = await this.adminClient.banners.create(input);
        return normalizeBannerResponse(response);
    }

    async updateBanner(id: string, input: Partial<CreateBannerInput>): Promise<Banner> {
        const response = await this.adminClient.banners.update(id, input);
        return normalizeBannerResponse(response);
    }

    async getBanner(id: string): Promise<Banner | null> {
        try {
            const response = await this.adminClient.banners.get(id);
            return normalizeBannerResponse(response);
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw error;
        }
    }

    async getBannerBySlug(slug: string): Promise<Banner | null> {
        // Fallback to list since there's no getBySlug endpoint in HttpClient
        const response = await this.adminClient.banners.list();
        const banners = normalizeBannerListResponse(response);
        return banners.find((b: any) => b.slug === slug) || null;
    }

    async getBanners(options: BannerListOptions = {}): Promise<Banner[]> {
        // Check if we should use position specific get if it existed, but HttpClient only has list
        const response = await this.adminClient.banners.list(options);
        let results = normalizeBannerListResponse(response);

        if (options.position) {
            results = results.filter((b: any) => b.position === options.position);
        }

        if (options.enabled !== undefined) {
            results = results.filter((b: Banner) => b.enabled === options.enabled);
        }
        return results;
    }

    async bulkDelete(ids: string[]): Promise<boolean> {
        await (this.adminClient.banners as any).bulkDelete({ ids });
        return true;
    }

    async deleteBanner(id: string): Promise<boolean> {
        await this.adminClient.banners.delete(id);
        return true;
    }
}
