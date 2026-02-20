'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/image-utils';

interface BannerImage {
  source?: string;
  preview?: string;
}

interface CollectionBanner {
  id: string;
  title?: string;
  name?: string;
  position: string;
  enabled: boolean;
  desktopImage?: BannerImage;
  mobileImage?: BannerImage;
  collection?: {
    slug?: string;
  };
}

interface CollectionHeaderBannerProps {
  title: string;
  collectionSlug?: string;
}

export default function CollectionHeaderBanner({ title, collectionSlug }: CollectionHeaderBannerProps) {
  const [banner, setBanner] = useState<CollectionBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchBanner() {
      if (!collectionSlug) {
        if (active) {
          setBanner(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/store/banners?position=COLLECTION_TOP&enabled=true&collection=${encodeURIComponent(collectionSlug)}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error(`Failed to load collection banner: ${response.status}`);
        }

        const data = await response.json();
        const list: CollectionBanner[] = Array.isArray(data) ? data : [];
        const nextBanner = list.find((item) => item.position === 'COLLECTION_TOP' && item.enabled) || null;

        if (active) {
          setBanner(nextBanner);
        }
      } catch {
        if (active) {
          setBanner(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchBanner();

    return () => {
      active = false;
    };
  }, [collectionSlug]);

  if (loading || !banner) {
    return null;
  }

  const desktopImage = getImageUrl(
    banner.desktopImage?.preview || banner.desktopImage?.source || banner.mobileImage?.preview || banner.mobileImage?.source
  );
  const mobileImage = getImageUrl(
    banner.mobileImage?.preview || banner.mobileImage?.source || banner.desktopImage?.preview || banner.desktopImage?.source
  );
  const bannerLink = banner.collection?.slug ? `/collections/${banner.collection.slug}` : `/collections/${collectionSlug}`;
  const bannerAlt = banner.title || banner.name || title;

  return (
    <Link href={bannerLink} className="block">
      <div className="relative mb-6 hidden h-32 w-full overflow-hidden md:block">
        <Image
          src={desktopImage}
          alt={bannerAlt}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>
      <div className="relative mb-6 block h-48 w-full overflow-hidden md:hidden">
        <Image
          src={mobileImage}
          alt={bannerAlt}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>
    </Link>
  );
}
