"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { UserSidebar } from "../../../components/user/UserSidebar";
import { AccountInfo } from "../../../components/user/AccountInfo";
import { BillingAddress } from "../../../components/user/BillingAddress";
import { OrderStats } from "../../../components/user/OrderStats";
import { RecentOrders } from "../../../components/user/RecentOrders";
import { OrdersPage } from "../../../components/user/OrdersPage";

type ActiveSection = 'dashboard' | 'orders' | 'track-order' | 'cart' | 'wishlist' | 'compare' | 'cards-address' | 'browsing-history' | 'settings';

export default function DashboardClient() {
  const { customer, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const { data: ordersData, isLoading: loading } = useOrders();
  const orders = ordersData?.orders || [];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/?auth=login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const section = searchParams.get('section') as ActiveSection;
    if (section && ['dashboard', 'orders', 'track-order', 'cart', 'wishlist', 'compare', 'cards-address', 'browsing-history', 'settings'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#F0F0F1] font-sans">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'processing').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Account Info */}
              <AccountInfo />

              {/* Billing Address */}
              <BillingAddress />

              {/* Order Stats */}
              <OrderStats
                totalOrders={totalOrders}
                pendingOrders={pendingOrders}
                completedOrders={completedOrders}
                loading={loading}
              />
            </div>

            {/* Recent Orders */}
            <RecentOrders orders={orders.slice(0, 5)} loading={loading} />
          </div>
        );
      case 'orders':
        return <OrdersPage />;
      case 'track-order':
        return (
          <div className="bg-white border border-gray-100 shadow-xs p-6">
            <h2 className="text-xl font-semibold mb-4">Track Order</h2>
            <p className="text-gray-600">Track order functionality coming soon...</p>
          </div>
        );
      case 'cart':
        return (
          <div className="bg-white border border-gray-100 shadow-xs p-6">
            <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
            <p className="text-gray-600">Shopping cart functionality coming soon...</p>
          </div>
        );
      case 'wishlist':
        return (
          <div className="bg-white border border-gray-100 shadow-xs p-6">
            <h2 className="text-xl font-semibold mb-4">Wishlist</h2>
            <p className="text-gray-600">Wishlist functionality coming soon...</p>
          </div>
        );
      case 'compare':
        return (
          <div className="bg-white border border-gray-100 shadow-xs p-6">
            <h2 className="text-xl font-semibold mb-4">Compare</h2>
            <p className="text-gray-600">Compare functionality coming soon...</p>
          </div>
        );
      case 'cards-address':
        return (
          <div className="bg-white border border-gray-100 shadow-xs p-6">
            <h2 className="text-xl font-semibold mb-4">Cards & Address</h2>
            <p className="text-gray-600">Cards & Address functionality coming soon...</p>
          </div>
        );
      case 'browsing-history':
        return (
          <div className="bg-white border border-gray-100 shadow-xs p-6">
            <h2 className="text-xl font-semibold mb-4">Browsing History</h2>
            <p className="text-gray-600">Browsing history functionality coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white border border-gray-100 shadow-xs p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600">Settings functionality coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="bg-white border border-gray-100 shadow-xs p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
            <p className="text-gray-600">Welcome to your dashboard!</p>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F0F1] font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <UserSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  );
}
