'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
            badgeVariant: 'info' as const,
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
            ],
        },
        {
            id: 'ADMIN' as const,
            title: 'Admin',
            badge: 'Most Features',
            badgeVariant: 'secondary' as const,
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
            ],
        },
        {
            id: 'EDITOR' as const,
            title: 'Editor',
            badge: 'Limited Access',
            badgeVariant: 'warning' as const,
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
            ],
        },
    ];

    const currentRole = roles.find((r) => r.id === selectedRole)!;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">User Roles & Permissions</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Overview of role-based access control. Assign roles to users in the Users tab.
                </p>

                <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as typeof selectedRole)}>
                    <TabsList>
                        {roles.map((role) => (
                            <TabsTrigger key={role.id} value={role.id}>
                                {role.title}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="space-y-4 mt-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-lg">{currentRole.title}</h3>
                                <Badge variant={currentRole.badgeVariant}>{currentRole.badge}</Badge>
                            </div>

                            <p className="text-sm text-gray-600">{currentRole.description}</p>

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
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Permission Policy</p>
                                <p>
                                    Permissions are currently fixed per role. Customizable granular permissions will be available in a future
                                    update.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {readOnly ? <p className="text-xs text-gray-500">Role templates are read-only in your current access level.</p> : null}
                </div>
            </div>
        </div>
    );
}
