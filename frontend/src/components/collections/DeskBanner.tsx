'use client';

import Image from 'next/image';
import Link from 'next/link';

interface DeskBannerProps {
  title: string;
}

export default function DeskBanner({ title }: DeskBannerProps) {
  return (
    <Link href="#" className="block">
      <div className="relative w-full h-32 mb-6 overflow-hidden">
        <Image
          src="/banners/deskbanner.jpg"
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>
    </Link>
  );
}
