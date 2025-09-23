'use client';

import Image from 'next/image';
import Link from 'next/link';

interface MobBannerProps {
  title: string;
}

export default function MobBanner({ title }: MobBannerProps) {
  return (
    <Link href="#" className="block">
      <div className="relative w-full h-48 mb-6 overflow-hidden">
        <Image
          src="/banners/mobbanner.jpg"
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>
    </Link>
  );
}
