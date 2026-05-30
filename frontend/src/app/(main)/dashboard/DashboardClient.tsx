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
import SectionContainer from "@/components/layout/SectionContainer";
import { Card, CardContent } from "@/components/ui/card";

type ActiveSection = 'dashboard' | 'orders' | 'track-order' | 'wishlist' | 'compare' | 'cards-address' | 'browsing-history' | 'settings';

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
    if (section && ['dashboard', 'orders', 'track-order', 'wishlist', 'compare', 'cards-address', 'browsing-history', 'settings'].includes(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#F0F0F1] font-sans">
        <SectionContainer className="px-10 sm:px-12 lg:px-16 py-8 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </SectionContainer>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AccountInfo />
              <BillingAddress />
              <OrderStats
                totalOrders={totalOrders}
                pendingOrders={pendingOrders}
                completedOrders={completedOrders}
                loading={loading}
              />
            </div>
            <RecentOrders orders={orders.slice(0, 5)} loading={loading} />
          </div>
        );
      case 'orders':
        return <OrdersPage />;
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2 capitalize">{activeSection.replace(/-/g, ' ')}</h2>
              <p className="text-gray-600">This section is coming soon...</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F0F1] font-sans">
      <SectionContainer className="px-10 sm:px-12 lg:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <UserSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          </div>
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </SectionContainer>
    </main>
  );
}
