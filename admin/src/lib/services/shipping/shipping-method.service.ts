import { BaseService } from '../base/base.service';
import { ShippingMethod, CreateShippingMethodInput, ShippingMethodListOptions } from './shipping.types';

export class ShippingMethodService extends BaseService {
    /**
     * Create a new shipping method
     */
    async createShippingMethod(input: CreateShippingMethodInput): Promise<ShippingMethod> {
        return this.adminClient.shipping.create(input);
    }

    /**
     * Update an existing shipping method
     */
    async updateShippingMethod(id: string, input: Partial<CreateShippingMethodInput>): Promise<ShippingMethod> {
        return this.adminClient.shipping.update(id, input);
    }

    /**
     * Delete a shipping method
     */
    async deleteShippingMethod(id: string): Promise<boolean> {
        await this.adminClient.shipping.delete(id);
        return true;
    }

    /**
     * Get a single shipping method by ID
     */
    async getShippingMethod(id: string): Promise<ShippingMethod | null> {
        try {
            return await this.adminClient.shipping.get(id);
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw error;
        }
    }

    /**
     * Get a list of shipping methods
     */
    async getShippingMethods(
        _options: ShippingMethodListOptions = {}
    ): Promise<ShippingMethod[]> {
        const response: any = await this.adminClient.shipping.list();
        return Array.isArray(response) ? response : (response.methods || []);
    }
}
