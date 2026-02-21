import { BaseService } from '../base/base.service';
import {
    ROLE_PERMISSIONS_SETTING_KEY,
    defaultRolePermissions,
    normalizeAdminRole,
    sanitizeRolePermissionsConfig,
} from '@/lib/auth/rbac';
import type { AdminRole, Permission, RolePermissionsMap, UserRole } from '@/lib/auth/rbac';

export interface AdminUserInput {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    role?: UserRole;
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

    async getRolePermissions(): Promise<RolePermissionsMap> {
        const settings = await this.getSettings();
        return sanitizeRolePermissionsConfig(settings?.[ROLE_PERMISSIONS_SETTING_KEY] ?? defaultRolePermissions);
    }

    async updateRolePermissions(rolePermissions: Record<AdminRole, Permission[]>): Promise<any> {
        const sanitized = sanitizeRolePermissionsConfig(rolePermissions);
        return this.updateSettings({ [ROLE_PERMISSIONS_SETTING_KEY]: sanitized });
    }

    async getAdminUsers(options?: any): Promise<any[]> {
        const response = await this.adminClient.users.list(options);
        const users = Array.isArray(response) ? response : (response?.users || []);
        return users.filter((user: any) => normalizeAdminRole(user?.role) !== null);
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
