'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Save, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/lib/auth/auth-client';
import {
    AdminRole,
    Permission,
    RolePermissionsMap,
    UserRole,
    ROLE_PERMISSIONS_SETTING_KEY,
    defaultRolePermissions,
    hasPermission,
    normalizeAdminRole,
    sanitizeRolePermissionsConfig,
} from '@/lib/auth/rbac';
import { AdminSettingsService } from '@/lib/services';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import SettingsLayout from './SettingsLayout';
import {
    GeneralTab,
    PaymentsTab,
    UsersTab,
    RolesTab,
    ShippingTab,
    TaxesTab,
    TabType,
    Settings,
    AdminUser,
} from './tabs';

export default function SettingsPage() {
    const settingsServiceRef = useRef<AdminSettingsService>(new AdminSettingsService());
    const settingsService = settingsServiceRef.current;
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autoSaved, setAutoSaved] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);
    const { data: session } = useSession();

    // Resolve permissions from role
    const userRole = normalizeAdminRole((session?.user as any)?.role);
    const canManageSettings = hasPermission(userRole, 'settings.manage');
    const canManageUsers = hasPermission(userRole, 'users.manage');

    // Define visibility/editability based on explicit permissions
    const viewOnlyTabs: TabType[] = ['general', 'shipping'];
    const canViewTab = (tab: TabType) => {
        if (tab === 'users' || tab === 'roles') return canManageUsers;
        if (tab === 'payments' || tab === 'taxes') return canManageSettings;
        return viewOnlyTabs.includes(tab);
    };
    const canEditTab = (tab: TabType) => {
        if (tab === 'users' || tab === 'roles') return canManageUsers;
        if (tab === 'payments' || tab === 'taxes' || tab === 'general' || tab === 'shipping') return canManageSettings;
        return false;
    };

    const [settings, setSettings] = useState<Settings>({
        general: {
            site_name: '',
            site_email: '',
            site_phone: '',
            site_address: '',
            default_currency: 'KES',
            timezone: 'Africa/Nairobi',
        },
        payments: {
            paystack_public_key: '',
            paystack_secret_key: '',
            paystack_enabled: false,
        },
        shipping: {
            methods: [],
            default_shipping_method: 'standard',
            free_shipping_threshold: 0,
            handling_fee: 0,
        },
        taxes: {
            tax_enabled: false,
            default_tax_rate: 0,
            tax_name: 'VAT',
            included_in_prices: false,
        },
    });

    // Admin Users State
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [rolePermissions, setRolePermissions] = useState<RolePermissionsMap>(() =>
        sanitizeRolePermissionsConfig(defaultRolePermissions),
    );
    const [savingRolePermissions, setSavingRolePermissions] = useState(false);
    const getErrorMessage = (error: any, fallback: string) => error?.message || error?.error || fallback;

    const fetchAdminUsers = async () => {
        setLoadingUsers(true);
        try {
            const users = await settingsService.getAdminUsers();
            setAdminUsers(users as AdminUser[]);
        } catch (error) {
            console.error('Error fetching admin users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const data = await settingsService.getSettings();
            setSettings(prev => ({
                general: { ...prev.general, ...data.general },
                payments: { ...prev.payments, ...data.payments },
                shipping: { ...prev.shipping, ...data.shipping },
                taxes: { ...prev.taxes, ...data.taxes },
            }));
            setRolePermissions(
                sanitizeRolePermissionsConfig(data?.[ROLE_PERMISSIONS_SETTING_KEY] ?? defaultRolePermissions),
            );
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchAdminUsers();
        }
    }, [activeTab]);

    // Auto-save effect with debouncing
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (loading) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            handleAutoSave();
        }, 1000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [settings]);

    const handleAutoSave = async () => {
        try {
            await settingsService.updateSettings(settings);
            setAutoSaved(true);
            setTimeout(() => setAutoSaved(false), 2000);
        } catch (error) {
            console.error('Error auto-saving settings:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsService.updateSettings(settings);
            toast({ title: 'Success', description: 'Settings saved successfully', variant: 'success' });
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast({ title: 'Save failed', description: getErrorMessage(error, 'An error occurred while saving'), variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
        if (!canManageUsers) return;
        try {
            await settingsService.updateAdminUser(userId, { role: newRole });
            toast({ title: 'Success', description: 'User role updated', variant: 'success' });
            fetchAdminUsers();
        } catch (error: any) {
            console.error('Error updating role:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to update role'), variant: 'error' });
        }
    };

    const handleToggleUserStatus = async (userId: string, enabled: boolean) => {
        if (!canManageUsers) return;
        try {
            await settingsService.updateAdminUser(userId, { enabled });
            toast({ title: 'Success', description: `User ${enabled ? 'enabled' : 'disabled'} successfully`, variant: 'success' });
            fetchAdminUsers();
        } catch (error: any) {
            console.error('Error toggling status:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to update status'), variant: 'error' });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!canManageUsers) return;
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await settingsService.deleteAdminUser(userId);
            toast({ title: 'Success', description: 'User deleted successfully', variant: 'success' });
            fetchAdminUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete user'), variant: 'error' });
        }
    };

    const handleCreateUser = async (user: any) => {
        if (!canManageUsers) return;
        try {
            await settingsService.createAdminUser(user);
            toast({ title: 'Success', description: 'User created successfully', variant: 'success' });
            fetchAdminUsers();
        } catch (error: any) {
            console.error('Error creating user:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'An error occurred'), variant: 'error' });
            throw error;
        }
    };

    const handleToggleRolePermission = async (
        role: AdminRole,
        permission: Permission,
        allowed: boolean,
    ) => {
        if (!canManageUsers || savingRolePermissions || role === 'SUPER_ADMIN') return;

        const previous = rolePermissions;
        const nextRolePermissions = new Set(previous[role] ?? []);
        if (allowed) {
            nextRolePermissions.add(permission);
        } else {
            nextRolePermissions.delete(permission);
        }

        const next = {
            ...previous,
            [role]: Array.from(nextRolePermissions),
        } as RolePermissionsMap;

        setRolePermissions(next);
        setSavingRolePermissions(true);
        try {
            await settingsService.updateRolePermissions(next);
        } catch (error: any) {
            setRolePermissions(previous);
            console.error('Error updating role permissions:', error);
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to update role permissions'), variant: 'error' });
        } finally {
            setSavingRolePermissions(false);
        }
    };

    const renderTabContent = () => {
        const isReadOnly = !canEditTab(activeTab);
        switch (activeTab) {
            case 'general': return <GeneralTab settings={settings} setSettings={setSettings} readOnly={isReadOnly} />;
            case 'payments': return <PaymentsTab settings={settings} setSettings={setSettings} readOnly={isReadOnly} />;
            case 'users': return (
                <UsersTab
                    adminUsers={adminUsers}
                    loadingUsers={loadingUsers}
                    onUpdateUserRole={handleUpdateUserRole}
                    onToggleUserStatus={handleToggleUserStatus}
                    onDeleteUser={handleDeleteUser}
                    onCreateUser={handleCreateUser}
                    readOnly={isReadOnly}
                />
            );
            case 'roles': return (
                <RolesTab
                    rolePermissions={rolePermissions}
                    onTogglePermission={handleToggleRolePermission}
                    saving={savingRolePermissions}
                    readOnly={isReadOnly}
                />
            );
            case 'shipping': return <ShippingTab readOnly={isReadOnly} />;
            case 'taxes': return <TaxesTab settings={settings} setSettings={setSettings} readOnly={isReadOnly} />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                            <p className="text-gray-600">Manage your store configuration and preferences</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {!canManageSettings && (
                                <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xs">
                                    View Only - Your role does not have settings management access
                                </div>
                            )}
                            {autoSaved && (
                                <Badge variant="success" className="gap-1.5 py-1.5 px-2.5">
                                    <CheckCircle className="w-4 h-4" />
                                    Auto-saved
                                </Badge>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={saving || !canManageSettings}
                                className="bg-primary-800 hover:bg-primary-900 text-white"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab} canViewTab={canViewTab}>
                        {renderTabContent()}
                    </SettingsLayout>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
