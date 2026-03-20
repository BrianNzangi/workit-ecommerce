import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/image-utils';
import { getBannerHref, type StoreBanner } from '@/lib/banner-target';
import SectionContainer from '@/components/layout/SectionContainer';

interface CollectionHeaderBannerProps {
  title: string;
  collectionSlug?: string | null;
  banner?: StoreBanner | null;
}

export default function CollectionHeaderBanner({
  title,
  collectionSlug,
  banner,
}: CollectionHeaderBannerProps) {
  if (!banner) {
    return null;
  }

  const desktopImage = getImageUrl(
    banner.desktopImage?.preview || banner.desktopImage?.source || banner.mobileImage?.preview || banner.mobileImage?.source
  );
  const mobileImage = getImageUrl(
    banner.mobileImage?.preview || banner.mobileImage?.source || banner.desktopImage?.preview || banner.desktopImage?.source
  );
  const bannerLink = getBannerHref(banner) || `/collections/${collectionSlug}`;
  const bannerAlt = banner.title || title;

  return (
    <SectionContainer>
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
    </SectionContainer>
  );
}
