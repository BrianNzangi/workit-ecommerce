'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SearchBar from '../SearchBar';
import CartSlide from '../CartSlide';
import MegaMenu from '@/components/menu/MegaMenu';
import MobileMegaMenu from '@/components/menu/MobileMegaMenu';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/menu/UserMenu';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOpen, openCart, closeCart, getTotalQuantity } = useCartStore();
  const cartItemCount = getTotalQuantity();

  return (
    <header id="site-header">
      {/* Top Bar */}
      <div className="bg-white font-sans text-secondary-900 border-b border-secondary-200">
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

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col px-4 py-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/workit-logo.png"
                  alt="Workit Logo"
                  width={120}   // adjust width as needed
                  height={50}   // adjust height as needed
                  priority
                  unoptimized
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-black text-2xl font-bold"
                aria-label="Close Menu"
              >
                &times;
              </button>
            </div>

            <MobileMegaMenu />

            <div className="border-t border-gray-200 mt-6">
              <AccountAccordion />
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Categories & Links (desktop only) */}
      <div className="bg-white text-secondary-900 border-b border-secondary-50 shadow-sm hidden md:block">
        <div className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-4 flex justify-between items-center">
          <MegaMenu />
        </div>
      </div>

      <CartSlide isOpen={isOpen} onClose={closeCart} />
    </header>
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
              <button
                onClick={() => router.push('/?auth=signup')}
                className="py-1 text-gray-600 font-sans hover:text-primary text-left"
              >
                Sign Up
              </button>
              <Link href="/help" className="py-1 text-gray-600 font-sans hover:text-primary">Help & Support</Link>
              <Link href="/about" className="py-1 text-gray-600 font-sans hover:text-primary">About</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="py-1 text-gray-600 font-sans hover:text-primary">My Account</Link>
              <Link href="/orders" className="py-1 text-gray-600 font-sans hover:text-primary">Orders</Link>
              <Link href="/help" className="py-1 text-gray-600 font-sans hover:text-primary">Help & Support</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
