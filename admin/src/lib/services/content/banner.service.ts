import { BaseService } from '../base/base.service';
import { Banner, CreateBannerInput, BannerListOptions } from './banner.types';

export class BannerService extends BaseService {
    async createBanner(input: CreateBannerInput): Promise<Banner> {
        return this.adminClient.banners.create(input);
    }

    async updateBanner(id: string, input: Partial<CreateBannerInput>): Promise<Banner> {
        return this.adminClient.banners.update(id, input);
    }

    async getBanner(id: string): Promise<Banner | null> {
        try {
            return await this.adminClient.banners.get(id);
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw error;
        }
    }

    async getBannerBySlug(slug: string): Promise<Banner | null> {
        // Fallback to list since there's no getBySlug endpoint in HttpClient
        const response = await this.adminClient.banners.list();
        const banners = Array.isArray(response) ? response : (response.banners || []);
        return banners.find((b: any) => b.slug === slug) || null;
    }

    async getBanners(options: BannerListOptions = {}): Promise<Banner[]> {
        // Check if we should use position specific get if it existed, but HttpClient only has list
        const response = await this.adminClient.banners.list(options);
        let results = Array.isArray(response) ? response : (response.banners || []);

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
