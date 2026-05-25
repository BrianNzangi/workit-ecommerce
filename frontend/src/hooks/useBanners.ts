'use client';

import { useQuery } from '@tanstack/react-query';
import type { StoreBanner } from '@/lib/banner/banner-target';

interface BannerParams {
    collection?: string | null;
    campaign?: string | null;
}

function sortBanners(banners: StoreBanner[]) {
    return banners
        .filter((banner) => banner.enabled && banner.position === 'COLLECTION_TOP')
        .sort((a, b) => a.sortOrder - b.sortOrder);
}

async function fetchBanners(params: BannerParams): Promise<StoreBanner | null> {
    const query = new URLSearchParams({ position: 'COLLECTION_TOP', enabled: 'true' });
    if (params.collection) query.set('collection', params.collection);
    if (params.campaign) query.set('campaign', params.campaign);

    const response = await fetch(`/api/store/banners?${query.toString()}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    const banners = Array.isArray(data) ? data : [];
    return sortBanners(banners)[0] || null;
}

export function useBanners(params: BannerParams) {
    return useQuery({
        queryKey: ['banners', params.collection, params.campaign],
        queryFn: () => fetchBanners(params),
        staleTime: 5 * 60 * 1000,
        enabled: !!(params.collection || params.campaign),
    });
}
