'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface RolesTabProps {
    readOnly?: boolean;
}

export default function RolesTab({ readOnly = false }: RolesTabProps) {
    const [selectedRole, setSelectedRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'EDITOR'>('SUPER_ADMIN');

    const roles = [
        {
            id: 'SUPER_ADMIN' as const,
            title: 'Super Admin',
            badge: 'Full Access',
            badgeColor: 'bg-purple-100 text-purple-700',
            description: 'Complete control over all system features and settings',
            permissions: [
                { name: 'Manage all users', allowed: true },
                { name: 'Manage products', allowed: true },
                { name: 'Manage orders', allowed: true },
                { name: 'Manage customers', allowed: true },
                { name: 'System settings', allowed: true },
                { name: 'Marketing campaigns', allowed: true },
                { name: 'Analytics & reports', allowed: true },
                { name: 'Content management', allowed: true },
            ]
        },
        {
            id: 'ADMIN' as const,
            title: 'Admin',
            badge: 'Most Features',
            badgeColor: 'bg-blue-100 text-blue-700',
            description: 'Manage products, orders, and customers (cannot manage users or system settings)',
            permissions: [
                { name: 'Manage users', allowed: false },
                { name: 'Manage products', allowed: true },
                { name: 'Manage orders', allowed: true },
                { name: 'Manage customers', allowed: true },
                { name: 'System settings', allowed: false },
                { name: 'Marketing campaigns', allowed: true },
                { name: 'Analytics & reports', allowed: true },
                { name: 'Content management', allowed: true },
            ]
        },
        {
            id: 'EDITOR' as const,
            title: 'Editor',
            badge: 'Limited Access',
            badgeColor: 'bg-yellow-100 text-yellow-700',
            description: 'Edit content and view reports (cannot manage users, orders, or settings)',
            permissions: [
                { name: 'Manage users', allowed: false },
                { name: 'Edit products', allowed: true },
                { name: 'Manage orders', allowed: false },
                { name: 'Manage customers', allowed: false },
                { name: 'System settings', allowed: false },
                { name: 'Marketing campaigns', allowed: false },
                { name: 'View reports', allowed: true },
                { name: 'Edit content', allowed: true },
            ]
        }
    ];

    const currentRole = roles.find(r => r.id === selectedRole)!;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    User Roles & Permissions
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Overview of role-based access control. Assign roles to users in the Users tab.
                </p>

                {/* Role Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${selectedRole === role.id
                                ? 'border-primary-800 text-primary-800'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {role.title}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {/* Selected Role Detail */}
                    <div className="border border-gray-200 rounded-xs shadow-xs p-6 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-lg">
                                {currentRole.title}
                            </h3>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${currentRole.badgeColor}`}>
                                {currentRole.badge}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            {currentRole.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentRole.permissions.map((perm, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xs bg-gray-50">
                                    {perm.allowed ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-gray-400 shrink-0" />
                                    )}
                                    <span className={`text-sm ${perm.allowed ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                        {perm.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xs p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Permission Policy</p>
                            <p>Permissions are currently fixed per role. Customizable granular permissions will be available in a future update.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
