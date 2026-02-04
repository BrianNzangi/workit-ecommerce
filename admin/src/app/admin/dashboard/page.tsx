'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useSession } from '@/lib/auth/auth-client';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Activity } from 'lucide-react';
import { TotalSalesCard, TotalOrdersCard, PendingCanceledCard, WeeklyReportCard, RecentOrdersTable } from '@/components/dashboard';

const HEALTH_QUERY = gql`
  query HealthCheck {
    _health
  }
`;

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: healthData } = useQuery(HEALTH_QUERY);

  return (
    <ProtectedRoute>
      <AdminLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session?.user?.name || 'Admin'}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <Activity className={`w-4 h-4 ${(healthData as any)?._health === 'ok' ? 'text-green-500' : 'text-orange-500'}`} />
            <span className="text-gray-600 font-medium">
              System Status: <span className={(healthData as any)?._health === 'ok' ? 'text-green-600' : 'text-orange-600'}>
                {(healthData as any)?._health === 'ok' ? 'Online' : 'Connecting...'}
              </span>
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <TotalSalesCard />
          <TotalOrdersCard />
          <PendingCanceledCard />
        </div>

        {/* Weekly Report */}
        <div className="mb-8">
          <WeeklyReportCard />
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <RecentOrdersTable />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
