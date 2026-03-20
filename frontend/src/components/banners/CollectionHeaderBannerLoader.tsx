'use client';

import { useEffect, useState } from 'react';
import CollectionHeaderBanner from '@/components/banners/CollectionHeaderBanner';
import type { StoreBanner } from '@/lib/banner-target';

interface CollectionHeaderBannerLoaderProps {
  title: string;
  collectionSlug?: string | null;
  campaignSlug?: string | null;
}

function sortBanners(banners: StoreBanner[]) {
  return banners
    .filter((banner) => banner.enabled && banner.position === 'COLLECTION_TOP')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function CollectionHeaderBannerLoader({
  title,
  collectionSlug,
  campaignSlug,
}: CollectionHeaderBannerLoaderProps) {
  const [banner, setBanner] = useState<StoreBanner | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBanner = async () => {
      const params = new URLSearchParams({
        position: 'COLLECTION_TOP',
        enabled: 'true',
      });

      if (collectionSlug) {
        params.set('collection', collectionSlug);
      }

      if (campaignSlug) {
        params.set('campaign', campaignSlug);
      }

      try {
        const response = await fetch(`/api/store/banners?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const banners = Array.isArray(data) ? data : [];
        const firstBanner = sortBanners(banners)[0] || null;

        if (!cancelled) {
          setBanner(firstBanner);
        }
      } catch {
        if (!cancelled) {
          setBanner(null);
        }
      }
    };

    if (collectionSlug || campaignSlug) {
      loadBanner();
    }

    return () => {
      cancelled = true;
    };
  }, [campaignSlug, collectionSlug]);

  if (!banner) {
    return null;
  }

  return (
    <CollectionHeaderBanner
      title={title}
      collectionSlug={campaignSlug || collectionSlug}
      banner={banner}
    />
  );
}
