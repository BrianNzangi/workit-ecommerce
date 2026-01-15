'use client';

import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';


import { useSession } from 'next-auth/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Package, ShoppingCart, Users, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';

const HEALTH_QUERY = gql`
  query HealthCheck {
    _health
  }
`;

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: healthData } = useQuery(HEALTH_QUERY);

  const [dashboardData, setDashboardData] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Products',
      value: loading ? '-' : dashboardData.products.toString(),
      icon: Package,
      color: 'blue',
      href: '/admin/products',
    },
    {
      label: 'Total Orders',
      value: loading ? '-' : dashboardData.orders.toString(),
      icon: ShoppingCart,
      color: 'green',
      href: '/admin/orders',
    },
    {
      label: 'Total Customers',
      value: loading ? '-' : dashboardData.customers.toString(),
      icon: Users,
      color: 'purple',
      href: '/admin/customers',
    },
    {
      label: 'Revenue',
      value: loading
        ? '-'
        : new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES'
        }).format(dashboardData.revenue / 100),
      icon: TrendingUp,
      color: 'orange',
      href: '/admin/analytics',
    },
  ];

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
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-end">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const bgColorClass = stat.color === 'brand' ? 'bg-[#FF5023]/10' : `bg-${stat.color}-100`;
            const textColorClass = stat.color === 'brand' ? 'text-[#FF5023]' : `text-${stat.color}-600`;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${bgColorClass} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${textColorClass}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </Link>
            );
          })}
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
