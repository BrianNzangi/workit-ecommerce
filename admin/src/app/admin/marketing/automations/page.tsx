'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    ShoppingCart,
    Eye,
    Mail,
    Gift,
    CheckCircle2,
    ArrowRight,
    Zap,
    RefreshCw,
    AlertCircle,
    TrendingUp,
} from 'lucide-react';

type AutomationStatus = 'active' | 'paused' | 'draft' | 'error';
type SyncStatus = 'synced' | 'out_of_sync' | 'never_synced';

interface AutomationTemplate {
    id: string;
    title: string;
    description: string;
    icon: any;
    status: AutomationStatus;
    syncStatus: SyncStatus;
    metrics?: {
        openRate: string;
        clickRate: string;
        conversions: number;
    };
    isPrebuilt?: boolean;
}

export default function AutomationsPage() {
    const [completedTasks] = useState(2);
    const totalTasks = 5;

    const templates: AutomationTemplate[] = [
        {
            id: 'abandoned-checkout',
            title: 'Recover abandoned checkout',
            description:
                'Send a series of emails to customers who leave items in their checkout. Proven to recover up to 15% of lost sales.',
            icon: ShoppingCart,
            status: 'active',
            syncStatus: 'synced',
            metrics: {
                openRate: '42.5%',
                clickRate: '12.8%',
                conversions: 84
            },
            isPrebuilt: true,
        },
        {
            id: 'welcome-discount',
            title: 'Welcome new subscribers',
            description:
                'Automatically send a welcome email with a special discount code to new email subscribers.',
            icon: Gift,
            status: 'active',
            syncStatus: 'synced',
            metrics: {
                openRate: '58.2%',
                clickRate: '24.1%',
                conversions: 156
            },
            isPrebuilt: true,
        },
        {
            id: 'abandoned-cart',
            title: 'Recover abandoned cart',
            description:
                'Send automated reminders to customers who added items to their cart but didn\'t complete the purchase.',
            icon: ShoppingCart,
            status: 'paused',
            syncStatus: 'out_of_sync',
            metrics: {
                openRate: '31.2%',
                clickRate: '8.4%',
                conversions: 22
            }
        },
        {
            id: 'post-purchase',
            title: 'Customer Win-back',
            description:
                'Re-engage customers who haven\'t purchased in 60 days with a personalized "We miss you" offer.',
            icon: Mail,
            status: 'draft',
            syncStatus: 'never_synced',
        },
        {
            id: 'abandoned-browse',
            title: 'Browse Abandonment',
            description:
                'Convert window shoppers by sending emails featuring products they recently viewed.',
            icon: Eye,
            status: 'error',
            syncStatus: 'synced',
        },
    ];

    const getStatusStyles = (status: AutomationStatus) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'paused':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'draft':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSyncIcon = (status: SyncStatus) => {
        switch (status) {
            case 'synced':
                return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
            case 'out_of_sync':
                return <RefreshCw className="w-3.5 h-3.5 text-amber-500" />;
            case 'never_synced':
                return <AlertCircle className="w-3.5 h-3.5 text-gray-400" />;
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Automations</h1>
                            <p className="text-gray-600">
                                Powered by Brevo. Orchestrate your customer journey with automated behaviors.
                            </p>
                        </div>
                        <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                            <Zap className="w-4 h-4" />
                            <span>Create Workflow</span>
                        </button>
                    </div>

                    {/* Performance Overview (New) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 mb-1 text-uppercase">Total Conversions</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-gray-900">262</h3>
                                <span className="text-sm font-medium text-green-600 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-0.5" /> +12%
                                </span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 mb-1 text-uppercase">Avg. Open Rate</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-gray-900">44.0%</h3>
                                <span className="text-sm font-medium text-gray-400">vs 38.0% last month</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm font-medium text-gray-500 mb-1 text-uppercase">Revenue Attributed</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold text-gray-900">KES 142,500</h3>
                            </div>
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => {
                            const Icon = template.icon;
                            return (
                                <div
                                    key={template.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden flex flex-col"
                                >
                                    <div className="p-6 flex-1">
                                        {/* Status Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyles(template.status)}`}>
                                                {template.status}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100" title="Sync Status with Brevo">
                                                {getSyncIcon(template.syncStatus)}
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                    {template.syncStatus.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-[#FF5023]/5 rounded-xl border border-[#FF5023]/10">
                                                <Icon className="w-6 h-6 text-[#FF5023]" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                    {template.title}
                                                </h3>
                                                {template.isPrebuilt && (
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Verified Template</span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                                            {template.description}
                                        </p>

                                        {/* Metrics (Only for non-drafts) */}
                                        {template.metrics && (
                                            <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-50 mb-6">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Open</p>
                                                    <p className="text-sm font-bold text-gray-900">{template.metrics.openRate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Click</p>
                                                    <p className="text-sm font-bold text-gray-900">{template.metrics.clickRate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Sales</p>
                                                    <p className="text-sm font-bold text-gray-900">{template.metrics.conversions}</p>
                                                </div>
                                            </div>
                                        )}

                                        {template.status === 'error' && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg mb-6 border border-red-100">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <p className="text-xs font-medium">Brevo API: Template ID #402 not found.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-[#FF5023] transition-colors">
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-white">
                                            {template.status === 'draft' ? 'Continue Setup' : 'View Performance'}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Help Section */}
                    <div className="mt-12 bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden">
                        <Zap className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white/5 rotate-12" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-3 text-[#FF5023]">Maximize your ROI with Brevo</h3>
                                <p className="text-gray-400 mb-6 max-w-lg">
                                    Your store is currently connected to Brevo. These automations run automatically in the background, recovering carts and engaging customers while you sleep.
                                </p>
                                <div className="flex gap-4">
                                    <button className="bg-[#FF5023] text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-[#FF5023]/20 hover:scale-105 transition-transform">
                                        Brevo Dashboard
                                    </button>
                                    <button className="bg-white/10 text-white border border-white/20 px-6 py-2.5 rounded-lg font-bold hover:bg-white/20 transition-colors">
                                        Documentation
                                    </button>
                                </div>
                            </div>
                            <div className="hidden lg:grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <h4 className="text-[#FF5023] font-bold text-xl mb-1">15k+</h4>
                                    <p className="text-xs text-gray-400 font-medium">Emails Sent</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <h4 className="text-[#FF5023] font-bold text-xl mb-1">2.4%</h4>
                                    <p className="text-xs text-gray-400 font-medium">Conv. Rate</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
