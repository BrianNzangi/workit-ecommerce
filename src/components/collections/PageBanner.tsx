'use client';

import DeskBanner from './DeskBanner';
import MobBanner from './MobBanner';

interface PageBannerProps {
  title: string;
}

export default function PageBanner({ title }: PageBannerProps) {
  return (
    <>
      {/* Desktop Banner - Hidden on mobile */}
      <div className="hidden md:block">
        <DeskBanner title={title} />
      </div>
      {/* Mobile Banner - Hidden on desktop */}
      <div className="block md:hidden">
        <MobBanner title={title} />
      </div>
    </>
  );
}
