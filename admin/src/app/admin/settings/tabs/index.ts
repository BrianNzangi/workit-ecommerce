// Central tab resolver - exports all tab components
import GeneralTab from './GeneralTab';
import PaymentsTab from './PaymentsTab';
import UsersTab from './UsersTab';
import RolesTab from './RolesTab';
import ShippingTab from './ShippingTab';
import TaxesTab from './TaxesTab';

export { GeneralTab, PaymentsTab, UsersTab, RolesTab, ShippingTab, TaxesTab };

// Tab type definition
export type TabType = 'general' | 'payments' | 'users' | 'roles' | 'shipping' | 'taxes';

// Settings interface - using backend field names (snake_case)
export interface Settings {
    general: {
        site_name: string;
        site_email: string;
        site_phone: string;
        site_address: string;
        default_currency: string;
        timezone: string;
    };
    payments: {
        paystack_public_key: string;
        paystack_secret_key: string;
        paystack_enabled: boolean;
    };
    shipping: {
        methods: Array<{
            id: string;
            code: string;
            name: string;
            description: string;
            isExpress: boolean;
        }>;
        default_shipping_method: string;
        free_shipping_threshold: number;
        handling_fee: number;
    };
    taxes: {
        tax_enabled: boolean;
        default_tax_rate: number;
        tax_name: string;
        included_in_prices: boolean;
    };
}

// Admin User interface
export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}
