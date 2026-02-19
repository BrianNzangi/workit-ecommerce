'use client';

import { ReactNode } from 'react';
import { Store, CreditCard, Shield, Truck, Receipt, Users } from 'lucide-react';
import { TabType } from './tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Tab {
    id: TabType;
    label: string;
    icon: typeof Store;
}

interface SettingsLayoutProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    children: ReactNode;
    canViewTab?: (tab: TabType) => boolean;
}

const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'shipping', label: 'Delivery', icon: Truck },
    { id: 'taxes', label: 'Taxes', icon: Receipt },
];

export default function SettingsLayout({
    activeTab,
    onTabChange,
    children,
    canViewTab = () => true,
}: SettingsLayoutProps) {
    const visibleTabs = tabs.filter((tab) => canViewTab(tab.id));

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-64 shrink-0">
                <Card>
                    <CardContent className="p-2 space-y-1">
                        {visibleTabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;

                            return (
                                <Button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    variant={active ? 'default' : 'ghost'}
                                    className={`w-full justify-start gap-3 ${active ? 'bg-primary-800 text-white hover:bg-primary-900' : ''}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </Button>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1">
                <Card>
                    <CardContent className="p-6">{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}
