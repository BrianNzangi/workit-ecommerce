'use client';

import SectionContainer from '@/components/layout/SectionContainer';
import MegaMenu from '@/components/menu/MegaMenu';

export default function MenuHeader() {
  return (
    <div className="bg-primary-900 text-white hidden md:block relative">
      <SectionContainer className="px-10 sm:px-12 lg:px-16">
        <div className="flex justify-between items-center">
          <MegaMenu />
        </div>
      </SectionContainer>
    </div>
  );
}
