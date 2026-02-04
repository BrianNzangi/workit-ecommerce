'use client';

import { ReactNode } from 'react';
import {
    Store,
    CreditCard,
    Shield,
    Truck,
    Receipt,
    Users,
} from 'lucide-react';
import { TabType } from './tabs';

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
    const visibleTabs = tabs.filter(tab => canViewTab(tab.id));

    return (
        <div className="flex gap-6">
            {/* Vertical Tabs */}
            <div className="w-64 shrink-0">
                <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-2">
                    {visibleTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xs text-left transition-colors ${activeTab === tab.id
                                    ? 'bg-primary-800 text-white shadow-xs'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
