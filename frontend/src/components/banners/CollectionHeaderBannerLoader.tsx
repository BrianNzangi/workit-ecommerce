'use client';

import CollectionHeaderBanner from '@/components/banners/CollectionHeaderBanner';
import { useBanners } from '@/hooks/useBanners';

interface CollectionHeaderBannerLoaderProps {
  title: string;
  collectionSlug?: string | null;
  campaignSlug?: string | null;
}

export default function CollectionHeaderBannerLoader({
  title,
  collectionSlug,
  campaignSlug,
}: CollectionHeaderBannerLoaderProps) {
  const { data: banner, isLoading } = useBanners({
    collection: collectionSlug,
    campaign: campaignSlug,
  });

  if (!banner || isLoading) {
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
