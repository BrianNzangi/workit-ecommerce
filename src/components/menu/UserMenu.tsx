"use client";

import { useState } from 'react';
import {
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
} from '@clerk/nextjs';
import Link from 'next/link';
import { CircleUser } from 'lucide-react';

export default function UserMenu() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useUser();

  const handleDashboardNavigation = (section: string) => {
    // Navigate to dashboard with section parameter
    window.location.href = `/dashboard?section=${section}`;
    setIsAuthOpen(false);
  };

  return (
    <div className="relative flex flex-col items-center cursor-pointer">
      <button onClick={() => setIsAuthOpen(!isAuthOpen)} className="flex flex-col items-center">
        <CircleUser className="h-6 w-6" />
        <span>Account</span>
      </button>
      {isAuthOpen && (
        <div className="absolute top-10 right-0 w-56 bg-white border border-gray-100 shadow-sm z-10">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="block w-full text-left p-2 hover:bg-gray-100">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="block w-full text-left p-2 hover:bg-gray-100">Sign Up</button>
            </SignUpButton>
            <Link href="/help" className="block w-full text-left p-2 hover:bg-gray-100">Help & Support</Link>
          </SignedOut>
          <SignedIn>
            <div className="border-b border-gray-200 mb-2 flex items-center justify-between px-2 py-1">
              <div className="text-sm font-medium text-gray-700">
                {user?.firstName ? `${user.firstName}'s Account` : 'My Account'}
              </div>
              <UserButton />
            </div>
            <button
              onClick={() => handleDashboardNavigation('dashboard')}
              className="block w-full text-left p-2 hover:bg-gray-100 text-sm"
            >
              My Dashboard
            </button>
            <button
              onClick={() => handleDashboardNavigation('orders')}
              className="block w-full text-left p-2 hover:bg-gray-100 text-sm"
            >
              Order History
            </button>
            <button
              onClick={() => handleDashboardNavigation('track-order')}
              className="block w-full text-left p-2 hover:bg-gray-100 text-sm"
            >
              Track Order
            </button>
            <button
              onClick={() => handleDashboardNavigation('settings')}
              className="block w-full text-left p-2 hover:bg-gray-100 text-sm"
            >
              Account Settings
            </button>
          </SignedIn>
        </div>
      )}
    </div>
  );
}
