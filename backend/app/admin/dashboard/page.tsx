'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useSession } from 'next-auth/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Activity } from 'lucide-react';
import Link from 'next/link';
import { TotalSalesCard, TotalOrdersCard, PendingCanceledCard, WeeklyReportCard } from '@/components/dashboard';

const HEALTH_QUERY = gql`
  query HealthCheck {
    _health
  }
`;

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: healthData } = useQuery(HEALTH_QUERY);

  const quickActions = [
    {
      title: 'Products',
      description: 'Manage your product catalog',
      href: '/admin/products',
      color: 'blue',
    },
    {
      title: 'Orders',
      description: 'View and manage orders',
      href: '/admin/orders',
      color: 'green',
    },
    {
      title: 'Customers',
      description: 'Manage customer accounts',
      href: '/admin/customers',
      color: 'purple',
    },
    {
      title: 'Collections',
      description: 'Organize products into collections',
      href: '/admin/collections',
      color: 'pink',
    },
    {
      title: 'Assets',
      description: 'Manage images and media',
      href: '/admin/assets',
      color: 'indigo',
    },
    {
      title: 'Blog',
      description: 'Create and manage blog posts',
      href: '/admin/blog',
      color: 'yellow',
    },
  ];

  return (
    <ProtectedRoute>
      <AdminLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session?.user?.name}!
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#FF5023] transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-center py-8">No recent activity to display</p>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
