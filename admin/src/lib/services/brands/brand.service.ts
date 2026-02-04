import { BaseService } from '../base/base.service';
import { Brand, CreateBrandInput } from './brand.types';

export class BrandService extends BaseService {
    async getBrands(): Promise<Brand[]> {
        const response: any = await this.adminClient.brands.list();
        return Array.isArray(response) ? response : (response.brands || []);
    }

    async getBrand(id: string): Promise<Brand> {
        return this.adminClient.brands.get(id);
    }

    async createBrand(data: CreateBrandInput): Promise<Brand> {
        return this.adminClient.brands.create(data);
    }

    async updateBrand(id: string, data: { name?: string; slug?: string; enabled?: boolean }): Promise<Brand> {
        return this.adminClient.brands.update(id, data);
    }

    async deleteBrand(id: string): Promise<{ success: boolean }> {
        return this.adminClient.brands.remove(id);
    }
}
