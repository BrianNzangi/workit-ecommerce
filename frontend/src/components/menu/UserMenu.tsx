'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleUser, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { customer, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-secondary-900 hover:text-primary-900 transition-colors"
      >
        <CircleUser className="h-6 w-6" />
        <span className="font-sans text-lg font-medium hidden lg:inline">
          {customer ? `${customer.firstName}` : 'Account'}
        </span>
        <ChevronDown className="h-4 w-4 hidden lg:inline" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-50 rounded-xl shadow-lg py-1 z-20">
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
                  href="/orders"
                  className="block px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/help"
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
                  onClick={() => {
                    router.push('/?auth=login');
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    router.push('/?auth=signup');
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                >
                  Sign Up
                </button>
                <Link
                  href="/help"
                  className="block px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Help & Support
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-2 text-sm font-sans text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
