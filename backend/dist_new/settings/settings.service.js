"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@workit/db"));
const database_module_1 = require("../database/database.module");
let SettingsService = class SettingsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getSetting(key) {
        const [setting] = await this.db
            .select()
            .from(schema.settings)
            .where((0, drizzle_orm_1.eq)(schema.settings.key, key))
            .limit(1);
        if (!setting) {
            throw new common_1.NotFoundException(`Setting with key "${key}" not found`);
        }
        return setting;
    }
    async getAllSettings() {
        return this.db.select().from(schema.settings);
    }
    async getSettingsObject() {
        const settings = await this.getAllSettings();
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
    }
    async getStructuredSettings() {
        const settings = await this.getAllSettings();
        const settingsObj = settings.reduce((acc, setting) => {
            const keys = setting.key.split('.');
            let current = acc;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = setting.value;
            return acc;
        }, {});
        const shippingMethods = await this.db
            .select({
            id: schema.shippingMethods.id,
            code: schema.shippingMethods.code,
            name: schema.shippingMethods.name,
            description: schema.shippingMethods.description,
            isExpress: schema.shippingMethods.isExpress,
        })
            .from(schema.shippingMethods)
            .where((0, drizzle_orm_1.eq)(schema.shippingMethods.enabled, true));
        return {
            general: {
                site_name: settingsObj.general?.site_name || '',
                site_email: settingsObj.general?.site_email || '',
                site_phone: settingsObj.general?.site_phone || '',
                site_address: settingsObj.general?.site_address || '',
                default_language: settingsObj.general?.default_language || 'en',
                timezone: settingsObj.general?.timezone || 'Africa/Nairobi',
                default_currency: settingsObj.general?.default_currency || 'KES',
            },
            payments: {
                payment_methods: settingsObj.payments?.payment_methods
                    ? JSON.parse(settingsObj.payments.payment_methods)
                    : ['paystack'],
                paystack_public_key: settingsObj.payments?.paystack_public_key || '',
                paystack_secret_key: settingsObj.payments?.paystack_secret_key || '',
                paystack_enabled: settingsObj.payments?.paystack_enabled === 'true' || false,
            },
            roles: {
                admin_email: settingsObj.roles?.admin_email || '',
                user_roles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
                permissions: settingsObj.roles?.permissions
                    ? JSON.parse(settingsObj.roles.permissions)
                    : {},
            },
            shipping: {
                methods: shippingMethods,
                default_shipping_method: settingsObj.shipping?.default_shipping_method || 'standard',
                free_shipping_threshold: parseFloat(settingsObj.shipping?.free_shipping_threshold || '0'),
                handling_fee: parseFloat(settingsObj.shipping?.handling_fee || '0'),
            },
            taxes: {
                tax_enabled: settingsObj.taxes?.tax_enabled === 'true' || false,
                default_tax_rate: parseFloat(settingsObj.taxes?.default_tax_rate || '0'),
                tax_name: settingsObj.taxes?.tax_name || 'VAT',
                included_in_prices: settingsObj.taxes?.included_in_prices === 'true' || false,
            },
            policies: {
                privacy_policy: settingsObj.policies?.privacy_policy || '',
                privacy_policy_enabled: settingsObj.policies?.privacy_policy_enabled === 'true' || true,
                terms_of_service: settingsObj.policies?.terms_of_service || '',
                return_policy: settingsObj.policies?.return_policy || '',
                shipping_policy: settingsObj.policies?.shipping_policy || '',
                contact_required: settingsObj.policies?.contact_required === 'true' || true,
            },
        };
    }
    async getPublicSettings() {
        const settings = await this.getAllSettings();
        const settingsMap = settings.reduce((acc, setting) => {
            const isSafe = (setting.key.startsWith('general.') ||
                setting.key.startsWith('policies.') ||
                setting.key.startsWith('shipping.') ||
                setting.key.startsWith('taxes.') ||
                setting.key === 'general.default_currency' ||
                setting.key === 'payments.paystack_public_key' ||
                setting.key === 'payments.paystack_enabled');
            if (isSafe && !setting.key.toLowerCase().includes('secret')) {
                acc[setting.key] = setting.value;
            }
            return acc;
        }, {});
        return settingsMap;
    }
    async upsertSetting(input) {
        const existing = await this.db
            .select()
            .from(schema.settings)
            .where((0, drizzle_orm_1.eq)(schema.settings.key, input.key))
            .limit(1);
        if (existing.length > 0) {
            const [updated] = await this.db
                .update(schema.settings)
                .set({
                value: input.value,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema.settings.key, input.key))
                .returning();
            return updated;
        }
        else {
            const [created] = await this.db
                .insert(schema.settings)
                .values(input)
                .returning();
            return created;
        }
    }
    async upsertStructuredSettings(settings) {
        const flattenSettings = (obj, prefix = '') => {
            const result = [];
            for (const [key, value] of Object.entries(obj)) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    result.push(...flattenSettings(value, newKey));
                }
                else {
                    result.push({
                        key: newKey,
                        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                    });
                }
            }
            return result;
        };
        const settingsToSave = flattenSettings(settings);
        const results = await Promise.all(settingsToSave.map(setting => this.upsertSetting(setting)));
        return results;
    }
    async deleteSetting(key) {
        const [deleted] = await this.db
            .delete(schema.settings)
            .where((0, drizzle_orm_1.eq)(schema.settings.key, key))
            .returning();
        if (!deleted) {
            throw new common_1.NotFoundException(`Setting with key "${key}" not found`);
        }
        return deleted;
    }
    async updateGeneralSettings(input) {
        return this.upsertStructuredSettings({ general: input });
    }
    async updatePaymentSettings(input) {
        return this.upsertStructuredSettings({ payments: input });
    }
    async updateShippingSettings(input) {
        return this.upsertStructuredSettings({ shipping: input });
    }
    async updateTaxSettings(input) {
        return this.upsertStructuredSettings({ taxes: input });
    }
    async updatePolicySettings(input) {
        return this.upsertStructuredSettings({ policies: input });
    }
    async updateRolesSettings(input) {
        return this.upsertStructuredSettings({ roles: input });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], SettingsService);
//# sourceMappingURL=settings.service.js.map