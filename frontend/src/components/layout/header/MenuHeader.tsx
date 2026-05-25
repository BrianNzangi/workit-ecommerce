'use client';

import MegaMenu from '@/components/menu/MegaMenu';

export default function MenuHeader() {
  return (
    <div className="bg-primary-900 text-white hidden md:block relative">
      <div className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-0 flex justify-between items-center">
        <MegaMenu />
      </div>
    </div>
  );
}
