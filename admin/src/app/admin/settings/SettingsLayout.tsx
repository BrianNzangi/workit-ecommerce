'use client';

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Store, CreditCard, Shield, Truck, Receipt, Users, Search } from 'lucide-react';
import { useSession } from '@/lib/auth/auth-client';
import { hasPermission, normalizeAdminRole } from '@/lib/auth/rbac';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TabType = 'general' | 'payments' | 'users' | 'roles' | 'shipping' | 'taxes';

interface Tab {
    id: TabType;
    label: string;
    icon: typeof Store;
    path: string;
}

const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: Store, path: '/admin/settings/general' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/admin/settings/payments' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/settings/users' },
    { id: 'roles', label: 'Roles', icon: Shield, path: '/admin/settings/roles' },
    { id: 'shipping', label: 'Delivery', icon: Truck, path: '/admin/settings/shipping' },
    { id: 'taxes', label: 'Taxes', icon: Receipt, path: '/admin/settings/taxes' },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    const userRole = normalizeAdminRole((session?.user as any)?.role);
    const canManageSettings = hasPermission(userRole, 'settings.manage');
    const canManageUsers = hasPermission(userRole, 'users.manage');

    const canViewTab = (tab: TabType) => {
        if (tab === 'users' || tab === 'roles') return canManageUsers;
        if (tab === 'payments' || tab === 'taxes') return canManageSettings;
        return true;
    };

    const [searchQuery, setSearchQuery] = useState('');

    const visibleTabs = tabs.filter((tab) => canViewTab(tab.id)).filter(tab => tab.label.toLowerCase().includes(searchQuery.toLowerCase()));

    const activeTab = tabs.find((tab) => pathname === tab.path)?.id || tabs[0]?.id;

    if (tabs.filter((tab) => canViewTab(tab.id)).length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">You do not have access to any settings.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-64 shrink-0">
                <div className="bg-white rounded-lg p-3 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search settings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-sm"
                        />
                    </div>
                    <div className="space-y-0.5">
                        {visibleTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = tab.id === activeTab;

                            return (
                                <Button
                                    key={tab.id}
                                    onClick={() => router.push(tab.path)}
                                    variant="ghost"
                                    className={`w-full justify-start gap-2.5 h-9 px-3 text-sm ${
                                        isActive
                                            ? 'bg-primary-800 text-white hover:bg-primary-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{tab.label}</span>
                                </Button>
                            );
                        })}
                        {visibleTabs.length === 0 && (
                            <div className="text-center py-4 text-sm text-gray-500">
                                No settings found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
