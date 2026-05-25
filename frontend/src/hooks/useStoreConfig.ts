'use client';

import { useQuery } from '@tanstack/react-query';

const CONFIG_KEY = ['store-config'] as string[];

interface StoreConfig {
    paystackPublicKey?: string;
    paystackEnabled?: boolean;
    currency?: string;
    [key: string]: unknown;
}

async function fetchStoreConfig(): Promise<StoreConfig> {
    const response = await fetch('/api/store/config');
    const config = await response.json();
    return config;
}

export function useStoreConfig() {
    return useQuery({
        queryKey: CONFIG_KEY,
        queryFn: fetchStoreConfig,
        staleTime: 10 * 60 * 1000,
    });
}
