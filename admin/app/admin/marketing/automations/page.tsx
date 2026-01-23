'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    ShoppingCart,
    Eye,
    Mail,
    Gift,
    CheckCircle2,
    ArrowRight,
    Zap,
} from 'lucide-react';

interface AutomationTemplate {
    id: string;
    title: string;
    description: string;
    icon: any;
    status: 'active' | 'inactive';
    isPrebuilt?: boolean;
}

export default function AutomationsPage() {
    const [completedTasks] = useState(0);
    const totalTasks = 5;

    const templates: AutomationTemplate[] = [
        {
            id: 'abandoned-checkout',
            title: 'Recover abandoned checkout',
            description:
                'An automated email is already created for you. Take a moment to review the email and make any additional adjustments to the design, messaging, or recipient list.',
            icon: ShoppingCart,
            status: 'inactive',
            isPrebuilt: true,
        },
        {
            id: 'abandoned-cart',
            title: 'Recover abandoned cart',
            description:
                'Send automated reminders to customers who added items to their cart but didn\'t complete the purchase.',
            icon: ShoppingCart,
            status: 'inactive',
        },
        {
            id: 'abandoned-browse',
            title: 'Convert abandoned product browse',
            description:
                'Re-engage customers who viewed products but didn\'t add them to cart with personalized recommendations.',
            icon: Eye,
            status: 'inactive',
        },
        {
            id: 'welcome-discount',
            title: 'Welcome new subscribers with a discount email',
            description:
                'Automatically send a welcome email with a special discount code to new email subscribers.',
            icon: Gift,
            status: 'inactive',
        },
        {
            id: 'post-purchase',
            title: 'Thank customers after they purchase',
            description:
                'Send a thank you email after purchase to build customer loyalty and encourage reviews.',
            icon: Mail,
            status: 'inactive',
        },
    ];

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Automations</h1>
                        <p className="text-gray-600">
                            Automate customer communications to increase engagement, sales, and return on
                            your marketing spend.
                        </p>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-gradient-to-br from-[#FF5023] to-[#E64519] rounded-lg shadow-lg p-6 mb-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">
                                    {completedTasks} of {totalTasks} tasks complete
                                </h2>
                                <p className="text-white/90">
                                    Start with these essential templates
                                </p>
                            </div>
                            <div className="bg-white/20 rounded-full p-4">
                                <Zap className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-white h-full rounded-full transition-all duration-500"
                                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => {
                            const Icon = template.icon;
                            return (
                                <div
                                    key={template.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group"
                                >
                                    <div className="p-6">
                                        {/* Icon */}
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="p-3 bg-[#FF5023]/10 rounded-lg">
                                                <Icon className="w-6 h-6 text-[#FF5023]" />
                                            </div>
                                            {template.isPrebuilt && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Pre-built
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {template.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-6 line-clamp-3">
                                            {template.description}
                                        </p>

                                        {/* Action Button */}
                                        <button className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-[#FF5023] text-gray-700 hover:text-white px-4 py-2.5 rounded-lg transition-all duration-200 group-hover:shadow-sm">
                                            <span className="font-medium">
                                                {template.status === 'active'
                                                    ? 'View Automation'
                                                    : 'Set Up'}
                                            </span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Status Bar */}
                                    <div
                                        className={`h-1 ${template.status === 'active'
                                            ? 'bg-green-500'
                                            : 'bg-gray-200'
                                            }`}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Info Section */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Why use automations?
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>
                                            Save time by automatically sending targeted emails based on
                                            customer behavior
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>
                                            Recover lost revenue from abandoned carts and checkouts
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>
                                            Build stronger customer relationships with personalized
                                            communications
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>
                                            Increase customer lifetime value with post-purchase engagement
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
