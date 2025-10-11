'use client';

import { useState } from 'react';
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '../SearchBar';
import CartSlide from '../CartSlide';
import MegaMenu from '@/components/menu/MegaMenu';
import MobileMegaMenu from '@/components/menu/MobileMegaMenu';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import UserMenu from '@/components/menu/UserMenu';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalQty = useCartStore((state) => state.getTotalQuantity());
  const isCartOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);

  return (
    <header id="site-header">
      {/* Top Bar */}
      <div className="bg-primary-900 font-[DM_SANS] text-primary-900">
        <div className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-4 flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
          {/* Logo */}
          <Link href="/" className="inline-block relative w-[150px] sm:w-[180px] md:w-[200px] lg:w-[120px] xl:w-[150px] h-auto">
            <Image
              src="/workit-logo.svg"
              alt="Workit Logo"
              width={250}        // Max width
              height={70}        // Aspect ratio height
              className="w-full h-auto object-contain"
              priority
            />
          </Link>
          {/* Desktop Search */}
          <div className="hidden md:flex flex-grow max-w-3xl w-full">
            <SearchBar />
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-6 text-white">
            <UserMenu />
            <button
              onClick={() => useCartStore.getState().openCart()}
              className="relative flex flex-col items-center font-['DM_Sans'] text-md text-white hover:text-primary"
            >
              <ShoppingBag className="h-6 w-6" />
              <span className='text-lg font-medium'>Cart</span>
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary-800 text-white rounded-full h-5 w-5 flex items-center justify-center font-['DM_Sans'] font-medium text-xs">
                  {totalQty}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Hamburger & Cart */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => useCartStore.getState().openCart()}
              className="relative text-black"
            >
              <ShoppingBag className="h-6 w-6" />
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FB2C36] text-white rounded-full h-5 w-5 flex items-center justify-center font-['DM_Sans'] font-medium text-xs">
                  {totalQty}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-black"
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
      <div className="bg-secondary-900 text-white border-b border-gray-200 hidden md:block">
        <div className="container mx-auto px-4 sm:px-0 md:px-8 lg:px-8 xl:px-10 2xl:px-8 py-4 flex justify-between items-center">
          <MegaMenu />
        </div>
      </div>

      <CartSlide isOpen={isCartOpen} onClose={closeCart} />
    </header>
  );
}



// Mobile Account Accordion
function AccountAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex justify-between items-center py-2 px-2 text-gray-700 font-medium"
      >
        Account
        <span>{open ? '-' : '+'}</span>
      </button>
      {open && (
        <div className="pl-4 flex flex-col gap-1">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="py-1 text-gray-600 hover:text-primary">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="py-1 text-gray-600 hover:text-primary">Sign Up</button>
            </SignUpButton>
            <Link href="/help" className="py-1 text-gray-600 hover:text-primary">Help & Support</Link>
            <Link href="/about" className="py-1 text-gray-600 hover:text-primary">About</Link>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      )}
    </div>
  );
}
