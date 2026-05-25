'use client';

import { useState } from 'react';
import { AlertCircle, Loader2, Shield, Users, FileEdit, BarChart3 } from 'lucide-react';
import {
    AdminRole,
    Permission,
    RolePermissionsMap,
    adminRoles,
    roleTitles,
} from '@/lib/auth/rbac';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface RolesTabProps {
    rolePermissions: RolePermissionsMap;
    onTogglePermission: (role: AdminRole, permission: Permission, allowed: boolean) => Promise<void>;
    saving?: boolean;
    readOnly?: boolean;
}

const permissionLabels: Record<Permission, { label: string; icon: typeof Shield }> = {
    'analytics.view': { label: 'View analytics and reports', icon: BarChart3 },
    'catalog.manage': { label: 'Manage catalog (products, brands, collections, assets)', icon: Shield },
    'customers.manage': { label: 'Manage customers', icon: Users },
    'marketing.content.manage': { label: 'Manage marketing content (blogs, banners, homepage)', icon: FileEdit },
    'orders.manage': { label: 'Manage orders', icon: Shield },
    'settings.manage': { label: 'Manage settings', icon: Shield },
    'shipping.manage': { label: 'Manage shipping', icon: Shield },
    'users.manage': { label: 'Manage admin users and roles', icon: Users },
};

const roleMetadata: Record<AdminRole, { badge: string; badgeVariant: 'info' | 'secondary' | 'default'; description: string }> = {
    SUPER_ADMIN: {
        badge: 'Full Access',
        badgeVariant: 'info',
        description: 'Complete control over all system features and settings',
    },
    ADMIN: {
        badge: 'Operational Access',
        badgeVariant: 'default',
        description: 'Runs day-to-day commerce operations without user/settings management',
    },
    EDITOR: {
        badge: 'Content Access',
        badgeVariant: 'secondary',
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
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">User Roles & Permissions</h2>
                <p className="text-sm text-gray-500 mt-0.5">Configure what each role can do. Assign roles to users from the Users tab.</p>
            </div>

            <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as typeof selectedRole)}>
                <TabsList>
                    {adminRoles.map((role) => (
                        <TabsTrigger key={role} value={role}>
                            {roleTitles[role]}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="bg-white rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">{roleTitles[selectedRole]}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{roleMetadata[selectedRole].description}</p>
                    </div>
                    <Badge variant={roleMetadata[selectedRole].badgeVariant} className="text-xs h-6 px-2">
                        {roleMetadata[selectedRole].badge}
                    </Badge>
                </div>

                {saving && (
                    <div className="text-sm text-blue-700 flex items-center gap-2 mb-4">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving permission changes...
                    </div>
                )}
                {roleIsLocked && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-800 mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Super Admin always keeps full access and cannot be modified.</span>
                    </div>
                )}

                <Separator className="mb-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(permissionLabels).map(([permission, { label, icon: Icon }]) => {
                        const allowed = currentRolePermissions.has(permission as Permission);
                        return (
                            <label
                                key={permission}
                                htmlFor={`${selectedRole}_${permission}`}
                                className={`flex items-center gap-3 p-2.5 rounded-md transition-colors cursor-pointer ${
                                    allowed
                                        ? 'bg-gray-50'
                                        : 'bg-white'
                                } ${readOnly || roleIsLocked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                            >
                                <Checkbox
                                    id={`${selectedRole}_${permission}`}
                                    checked={allowed}
                                    onCheckedChange={(checked) =>
                                        onTogglePermission(selectedRole, permission as Permission, checked === true)
                                    }
                                    disabled={readOnly || saving || roleIsLocked}
                                />
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Icon className={`w-4 h-4 shrink-0 ${allowed ? 'text-primary-800' : 'text-gray-400'}`} />
                                    <span className={`text-sm ${allowed ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                        {label}
                                    </span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900">Customer</h3>
                    <Badge variant="outline" className="text-xs h-6 px-2">Storefront Only</Badge>
                </div>
                <p className="text-sm text-gray-600">
                    Customers can sign in and shop on the storefront. They do not get admin permissions.
                </p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-medium mb-0.5">Permission Policy</p>
                    <p className="text-blue-700">Permission changes are saved and enforced by backend authorization checks.</p>
                </div>
            </div>
        </div>
    );
}
