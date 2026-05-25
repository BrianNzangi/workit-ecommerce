'use client';

import { useQuery } from '@tanstack/react-query';

const ZONES_KEY = ['shipping-zones'] as const;

interface ShippingCity {
    id: string;
    cityTown: string;
    standardPrice: number;
    expressPrice?: number | null;
}

interface ShippingZone {
    id: string;
    county: string;
    cities: ShippingCity[];
}

async function fetchShippingZones(): Promise<ShippingZone[]> {
    const response = await fetch('/api/shipping-zones');
    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Failed to fetch shipping zones');
    }

    const allZones: ShippingZone[] = [];
    if (Array.isArray(result.data)) {
        result.data.forEach((item: any) => {
            if (item.zones && Array.isArray(item.zones)) {
                allZones.push(...item.zones);
            } else if (item.county || item.cities) {
                allZones.push(item);
            }
        });
    }
    return allZones;
}

export function useShippingZones() {
    return useQuery({
        queryKey: ZONES_KEY,
        queryFn: fetchShippingZones,
        staleTime: 10 * 60 * 1000,
    });
}
