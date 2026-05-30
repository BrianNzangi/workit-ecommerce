'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { BarChart3, Eye } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
    { label: 'Dashboard', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Product Views', icon: Eye, path: '/admin/analytics/views' },
];

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const activeTab = tabs.find((t) => t.path === pathname)?.label || tabs[0]?.label;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="w-full p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
                        <p className="text-gray-600">Track your store performance and key metrics</p>
                    </div>

                    <Tabs value={activeTab} onValueChange={(val) => {
                        const tab = tabs.find((t) => t.label === val);
                        if (tab) router.push(tab.path);
                    }}>
                        <TabsList>
                            {tabs.map((tab) => (
                                <TabsTrigger key={tab.label} value={tab.label}>
                                    <tab.icon className="w-4 h-4 mr-2" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="mt-6">
                        {children}
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
