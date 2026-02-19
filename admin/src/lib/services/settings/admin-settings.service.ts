import { BaseService } from '../base/base.service';

export interface AdminUserInput {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    role?: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
    enabled?: boolean;
}

export interface ShippingZoneInput {
    shippingMethodId: string;
    county: string;
    cities: Array<{
        id?: string;
        cityTown: string;
        standardPrice: number;
        expressPrice?: number;
    }>;
}

export class AdminSettingsService extends BaseService {
    async getSettings(): Promise<any> {
        return this.adminClient.settings.getAll();
    }

    async updateSettings(settings: Record<string, any>): Promise<any> {
        return this.adminClient.settings.updateAll(settings);
    }

    async getAdminUsers(options?: any): Promise<any[]> {
        const response = await this.adminClient.users.list(options);
        return Array.isArray(response) ? response : (response?.users || []);
    }

    async createAdminUser(user: AdminUserInput): Promise<any> {
        return this.adminClient.users.create(user);
    }

    async updateAdminUser(userId: string, input: AdminUserInput): Promise<any> {
        return this.adminClient.users.update(userId, input);
    }

    async deleteAdminUser(userId: string): Promise<any> {
        return this.adminClient.users.remove(userId);
    }

    async getShippingMethods(options?: any): Promise<any[]> {
        const response = await this.adminClient.shipping.list(options);
        return Array.isArray(response) ? response : (response?.methods || []);
    }

    async createShippingZone(input: ShippingZoneInput): Promise<any> {
        return this.adminClient.shippingZones.create(input);
    }

    async updateShippingZone(zoneId: string, input: ShippingZoneInput): Promise<any> {
        return this.adminClient.shippingZones.update(zoneId, input);
    }

    async deleteShippingZone(zoneId: string): Promise<any> {
        return this.adminClient.shippingZones.delete(zoneId);
    }
}
