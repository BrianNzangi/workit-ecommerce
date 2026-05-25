'use client';

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
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
import { Settings, AdminUser } from './tabs';

interface SettingsContextValue {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    adminUsers: AdminUser[];
    loadingUsers: boolean;
    rolePermissions: RolePermissionsMap;
    savingRolePermissions: boolean;
    canManageSettings: boolean;
    canManageUsers: boolean;
    userRole: string | null;
    saving: boolean;
    isDirty: boolean;
    handleSave: () => Promise<void>;
    handleCancel: () => void;
    onUpdateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
    onToggleUserStatus: (userId: string, enabled: boolean) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    onCreateUser: (user: any) => Promise<void>;
    onTogglePermission: (role: AdminRole, permission: Permission, allowed: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettingsContext() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
    return ctx;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const settingsServiceRef = useRef<AdminSettingsService>(new AdminSettingsService());
    const settingsService = settingsServiceRef.current;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { data: session } = useSession();

    const userRole = normalizeAdminRole((session?.user as any)?.role);
    const canManageSettings = hasPermission(userRole, 'settings.manage');
    const canManageUsers = hasPermission(userRole, 'users.manage');

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
            webhook_url: '',
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
    
    const [initialSettings, setInitialSettings] = useState<Settings>(settings);
    const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

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
            const newSettings = {
                general: { ...settings.general, ...data.general },
                payments: { ...settings.payments, ...data.payments },
                shipping: { ...settings.shipping, ...data.shipping },
                taxes: { ...settings.taxes, ...data.taxes },
            };
            setSettings(newSettings);
            setInitialSettings(newSettings);
            
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
        fetchAdminUsers();
    }, []);

    const handleCancel = () => {
        setSettings(initialSettings);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsService.updateSettings(settings);
            setInitialSettings(settings);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
            </div>
        );
    }

    const ctx: SettingsContextValue = {
        settings,
        setSettings,
        adminUsers,
        loadingUsers,
        rolePermissions,
        savingRolePermissions,
        canManageSettings,
        canManageUsers,
        userRole,
        saving,
        isDirty,
        handleSave,
        handleCancel,
        onUpdateUserRole: handleUpdateUserRole,
        onToggleUserStatus: handleToggleUserStatus,
        onDeleteUser: handleDeleteUser,
        onCreateUser: handleCreateUser,
        onTogglePermission: handleToggleRolePermission,
    };

    return (
        <SettingsContext.Provider value={ctx}>
            {children}
        </SettingsContext.Provider>
    );
}

export function SettingsHeader() {
    const { canManageSettings } = useSettingsContext();

    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-0.5">Store configuration and preferences</p>
            </div>
            <div className="flex items-center gap-3">
                {!canManageSettings && (
                    <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-1.5 rounded-md">
                        View Only - Your role does not have settings management access
                    </div>
                )}
            </div>
        </div>
    );
}

export function SettingsActionBar() {
    const { isDirty, saving, handleSave, handleCancel, canManageSettings } = useSettingsContext();

    if (!isDirty || !canManageSettings) return null;

    return (
        <div className="sticky bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md p-3 mt-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Unsaved changes
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                        className="h-9"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary-800 hover:bg-primary-900 text-white min-w-[120px] h-9"
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
