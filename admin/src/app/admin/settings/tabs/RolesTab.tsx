'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
    AdminRole,
    Permission,
    RolePermissionsMap,
    adminRoles,
    roleTitles,
} from '@/lib/auth/rbac';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RolesTabProps {
    rolePermissions: RolePermissionsMap;
    onTogglePermission: (role: AdminRole, permission: Permission, allowed: boolean) => Promise<void>;
    saving?: boolean;
    readOnly?: boolean;
}

const permissionLabels: Record<Permission, string> = {
    'analytics.view': 'View analytics and reports',
    'catalog.manage': 'Manage catalog (products, brands, collections, assets)',
    'customers.manage': 'Manage customers',
    'marketing.campaigns.manage': 'Manage campaigns',
    'marketing.content.manage': 'Manage marketing content (blogs, banners, homepage)',
    'orders.manage': 'Manage orders',
    'settings.manage': 'Manage settings',
    'shipping.manage': 'Manage shipping',
    'users.manage': 'Manage admin users and roles',
};

const roleMetadata: Record<AdminRole, { badge: string; badgeVariant: 'info' | 'secondary' | 'warning'; description: string }> = {
    SUPER_ADMIN: {
        badge: 'Full Access',
        badgeVariant: 'info',
        description: 'Complete control over all system features and settings',
    },
    ADMIN: {
        badge: 'Operational Access',
        badgeVariant: 'secondary',
        description: 'Runs day-to-day commerce operations without user/settings management',
    },
    EDITOR: {
        badge: 'Content Access',
        badgeVariant: 'warning',
        description: 'Manages catalog and content, with analytics visibility only',
    },
};

export default function RolesTab({
    rolePermissions,
    onTogglePermission,
    saving = false,
    readOnly = false,
}: RolesTabProps) {
    const [selectedRole, setSelectedRole] = useState<AdminRole>('SUPER_ADMIN');
    const currentRolePermissions = new Set(rolePermissions[selectedRole] ?? []);
    const roleIsLocked = selectedRole === 'SUPER_ADMIN';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">User Roles & Permissions</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Configure what each role can do. Assign roles to users from the Users tab.
                </p>

                <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as typeof selectedRole)}>
                    <TabsList>
                        {adminRoles.map((role) => (
                            <TabsTrigger key={role} value={role}>
                                {roleTitles[role]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                <div className="space-y-4 mt-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 text-lg">{roleTitles[selectedRole]}</h3>
                                <Badge variant={roleMetadata[selectedRole].badgeVariant}>{roleMetadata[selectedRole].badge}</Badge>
                            </div>

                            <p className="text-sm text-gray-600">{roleMetadata[selectedRole].description}</p>
                            {saving ? (
                                <div className="text-sm text-blue-700 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving permission changes...
                                </div>
                            ) : null}
                            {roleIsLocked ? (
                                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xs px-3 py-2">
                                    Super Admin always keeps full access and cannot be modified.
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(permissionLabels).map(([permission, label]) => {
                                    const allowed = currentRolePermissions.has(permission as Permission);
                                    return (
                                        <div key={permission} className="flex items-center gap-3 p-3 rounded-xs bg-gray-50">
                                            <Checkbox
                                                id={`${selectedRole}_${permission}`}
                                                checked={allowed}
                                                onCheckedChange={(checked) =>
                                                    onTogglePermission(selectedRole, permission as Permission, checked === true)
                                                }
                                                disabled={readOnly || saving || roleIsLocked}
                                            />
                                            <label
                                                htmlFor={`${selectedRole}_${permission}`}
                                                className={`text-sm ${allowed ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                                            >
                                                {label}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-dashed">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">Customer</h4>
                                <Badge variant="secondary">Storefront Only</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                                Customers can sign in and shop on the storefront. They do not get admin permissions.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Permission Policy</p>
                                <p>
                                    Permission changes are saved and enforced by backend authorization checks.
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
