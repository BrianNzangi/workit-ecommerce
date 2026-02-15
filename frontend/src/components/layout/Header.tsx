'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SearchBar from '../SearchBar';
import CartSlide from '../CartSlide';
import MegaMenu from '@/components/menu/MegaMenu';
import MobileMegaMenu from '@/components/menu/MobileMegaMenu';
import { ShoppingBag, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/menu/UserMenu';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOpen, openCart, closeCart, getTotalQuantity } = useCartStore();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

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
      <header id="site-header" className="bg-white">
        {/* Top Bar */}
        <div className="bg-white font-sans text-secondary-900 border-b border-gray-300">
          <div className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-4 flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
            {/* Logo */}
            <Link href="/" className="inline-block relative w-[150px] sm:w-[180px] md:w-[200px] lg:w-[120px] xl:w-[150px] h-auto">
              <Image
                src="/workit-logo.png"
                alt="Workit Logo"
                width={250}        // Max width
                height={70}        // Aspect ratio height
                className="w-full h-auto object-contain"
                priority
                unoptimized
              />
            </Link>
            {/* Desktop Search */}
            <div className="hidden md:flex grow max-w-3xl w-full">
              <SearchBar />
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-6 text-secondary-900">
              <UserMenu />
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 font-sans text-md text-secondary-900 hover:text-primary-900 transition-colors"
              >
                <div className="relative">
                  <ShoppingBag className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className='text-lg font-medium'>Cart</span>
              </button>
            </div>

            {/* Mobile Hamburger & Cart */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={openCart}
                className="relative text-secondary-900"
              >
                <div className="relative">
                  <ShoppingBag className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-900 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-secondary-900"
                aria-label="Toggle Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Search (full width) */}
          <div className="md:hidden px-4 pb-2">
            <SearchBar />
          </div>

          {/* Mobile Slide-in Menu */}
          <div
            className={`fixed inset-0 z-50 transition-colors duration-300 ${mobileMenuOpen ? 'bg-black/50 pointer-events-auto' : 'bg-transparent pointer-events-none'
              }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className={`absolute top-0 left-0 h-full w-[85%] max-w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Menu Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="inline-block relative w-[100px] h-auto">
                  <Image
                    src="/workit-logo.png"
                    alt="Workit Logo"
                    width={120}
                    height={50}
                    className="w-full h-auto object-contain"
                    priority
                    unoptimized
                  />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
                  aria-label="Close Menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2">
                <MobileMegaMenu />
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <AccountAccordion />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Row 2: Categories & Links (desktop only) - Non-sticky */}
      <div className="bg-white text-secondary-900 border-b border-gray-300 hidden md:block relative">
        <div className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-2 flex justify-between items-center">
          <MegaMenu />
        </div>
      </div>

      <CartSlide isOpen={isOpen} onClose={closeCart} />
    </div>
  );
}



// Mobile Account Accordion
function AccountAccordion() {
  const [open, setOpen] = useState(false);
  const { customer } = useAuth();
  const router = useRouter();

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex justify-between items-center py-2 px-2 font-sans text-gray-700 font-medium"
      >
        Account
        <span>{open ? '-' : '+'}</span>
      </button>
      {open && (
        <div className="pl-4 flex flex-col gap-1 text-left">
          {!customer ? (
            <>
              <button
                onClick={() => router.push('/?auth=login')}
                className="py-1 text-gray-600 font-sans hover:text-primary text-left"
              >
                Sign In
              </button>
              <Link href="/?auth=signup" className="py-1 text-gray-600 font-sans hover:text-primary text-left" onClick={() => setOpen(false)}>
                Sign Up
              </Link>
              <Link href="/help-center" className="py-1 text-gray-600 font-sans hover:text-primary" onClick={() => setOpen(false)}>Help & Support</Link>
              <Link href="/about-workit" className="py-1 text-gray-600 font-sans hover:text-primary" onClick={() => setOpen(false)}>About</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="py-1 text-gray-600 font-sans hover:text-primary" onClick={() => setOpen(false)}>My Account</Link>
              <Link href="/dashboard?section=orders" className="py-1 text-gray-600 font-sans hover:text-primary" onClick={() => setOpen(false)}>Orders</Link>
              <Link href="/help-center" className="py-1 text-gray-600 font-sans hover:text-primary" onClick={() => setOpen(false)}>Help & Support</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
