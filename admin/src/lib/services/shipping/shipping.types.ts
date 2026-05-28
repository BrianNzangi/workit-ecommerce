export interface ShippingCity {
    id: string;
    zoneId: string;
    cityTown: string;
    standardPrice: number;
    expressPrice: number;
    createdAt: string;
    updatedAt: string;
}

export interface ShippingZone {
    id: string;
    shippingMethodId: string;
    county: string;
    createdAt: string;
    updatedAt: string;
    cities?: ShippingCity[];
}

export interface ShippingMethod {
    id: string;
    name: string;
    description: string | null;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    zones?: ShippingZone[];
}

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
