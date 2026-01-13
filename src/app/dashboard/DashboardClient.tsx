"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { UserSidebar } from "../../components/user/UserSidebar";
import { AccountInfo } from "../../components/user/AccountInfo";
import { BillingAddress } from "../../components/user/BillingAddress";
import { OrderStats } from "../../components/user/OrderStats";
import { RecentOrders } from "../../components/user/RecentOrders";
import { OrdersPage } from "../../components/user/OrdersPage";

interface Order {
  id: string;
  date_created: string;
  status: string;
  total: string;
  currency: string;
  line_items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
}

type ActiveSection = 'dashboard' | 'orders' | 'track-order' | 'cart' | 'wishlist' | 'compare' | 'cards-address' | 'browsing-history' | 'settings';

export default function DashboardClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const section = searchParams.get('section') as ActiveSection;
    if (section && ['dashboard', 'orders', 'track-order', 'cart', 'wishlist', 'compare', 'cards-address', 'browsing-history', 'settings'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

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
    <main className="min-h-screen bg-gray-50 font-[DM_SANS]">
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
