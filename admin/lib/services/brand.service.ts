
import { apiClient } from '@/lib/api-client';

export interface Brand {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    metrics?: {
        productCount: number;
    };
}

export class BrandService {
    async getBrands(): Promise<Brand[]> {
        return apiClient.get<Brand[]>('/brands');
    }

    async getBrand(id: string): Promise<Brand> {
        return apiClient.get<Brand>(`/brands/${id}`);
    }

    async createBrand(data: Partial<Brand>): Promise<Brand> {
        return apiClient.post<Brand>('/brands', data);
    }

    async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
        return apiClient.put<Brand>(`/brands/${id}`, data);
    }

    async deleteBrand(id: string): Promise<void> {
        return apiClient.delete(`/brands/${id}`);
    }
}
