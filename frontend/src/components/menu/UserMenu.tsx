'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleUser, ChevronDown } from 'lucide-react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [supportsHover, setSupportsHover] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { customer, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const closeMenuWithDelay = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateSupportsHover = () => setSupportsHover(mediaQuery.matches);

    updateSupportsHover();
    mediaQuery.addEventListener('change', updateSupportsHover);
    return () => mediaQuery.removeEventListener('change', updateSupportsHover);
  }, []);

  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  const openAuthModal = (type: 'login' | 'signup') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('auth', type);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (supportsHover) openMenu();
      }}
      onMouseLeave={() => {
        if (supportsHover) closeMenuWithDelay();
      }}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        onFocus={() => supportsHover && openMenu()}
        className="flex items-center gap-2 text-secondary-900 hover:text-primary-900 transition-colors"
      >
        <CircleUser className="h-6 w-6" />
        <span className="font-sans text-lg font-medium hidden lg:inline" suppressHydrationWarning>
          {customer ? `${customer.firstName}` : 'Account'}
        </span>
        <ChevronDown className="h-4 w-4 hidden lg:inline" />
      </button>

      {isOpen && (
        <>
          {!supportsHover && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
          )}

          <div
            className="absolute right-0 top-full pt-2 z-20"
            onMouseEnter={() => {
              if (supportsHover) openMenu();
            }}
            onMouseLeave={() => {
              if (supportsHover) closeMenuWithDelay();
            }}
          >
            <div className="w-48 bg-gray-100 border border-primary-100 rounded-lg shadow-xl py-1">
              {customer ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {customer.emailAddress}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/dashboard?section=orders"
                    className="block px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/help-center"
                    className="block px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Help & Support
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm font-sans text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="mx-3 my-2 w-[calc(100%-24px)] rounded-md bg-primary-900 px-4 py-2 text-sm font-sans font-medium text-white hover:bg-primary-800"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/help-center"
                    className="block px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Help & Support
                  </Link>
                  <Link
                    href="/about-workit"
                    className="block px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
