import { shipping } from '@workit/api';

export type ShippingMethod = shipping.ShippingMethod;

export interface CreateShippingMethodInput {
    name: string;
    description?: string;
    enabled?: boolean;
}

export interface ShippingMethodListOptions {
    take?: number;
    skip?: number;
    enabledOnly?: boolean;
}
