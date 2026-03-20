'use client';

import { useState, useEffect, useRef } from 'react';
import CartSlide from '../CartSlide';
import MainHeader from '@/components/layout/MainHeader';
import MenuHeader from '@/components/layout/MenuHeader';
import { useCartStore } from '@/store/cartStore';
import { prefetchNavigationCollectionsDisplayClient } from '@/lib/collections-client';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOpen, openCart, closeCart, getTotalQuantity } = useCartStore();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    prefetchNavigationCollectionsDisplayClient();

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          '--header-height',
          `${headerRef.current.offsetHeight}px`
        );
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const cartItemCount = mounted ? getTotalQuantity() : 0;

  return (
    <div ref={headerRef} className="sticky top-0 z-50 bg-white shadow-xs">
      <MainHeader
        cartItemCount={cartItemCount}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onOpenCart={openCart}
      />
      <MenuHeader />
      {/* Future extension point: add <AdsHeader /> below MenuHeader when needed. */}

      <CartSlide isOpen={isOpen} onClose={closeCart} />
    </div>
  );
}
