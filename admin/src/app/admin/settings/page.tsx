'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Save, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/lib/auth/auth-client';
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

    // Get user role
    const userRole = (session?.user as any)?.role as 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | undefined;
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || session?.user?.email === 'admin@workit.co.ke';

    // Define which tabs are viewable by non-super-admin users
    const viewOnlyTabs: TabType[] = ['general', 'shipping'];
    const canViewTab = (tab: TabType) => {
        if (isSuperAdmin) return true;
        return viewOnlyTabs.includes(tab);
    };
    const canEditTab = (tab: TabType) => {
        if (isSuperAdmin) return true;
        return false; // Only super admin can edit
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
                ...prev,
                ...data,
                general: { ...prev.general, ...data.general },
                payments: { ...prev.payments, ...data.payments },
                shipping: { ...prev.shipping, ...data.shipping },
                taxes: { ...prev.taxes, ...data.taxes },
            }));
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

    const handleUpdateUserRole = async (userId: string, newRole: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR') => {
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
            case 'roles': return <RolesTab readOnly={isReadOnly} />;
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
                            {!isSuperAdmin && (
                                <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xs">
                                    View Only - Contact Super Admin to make changes
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
                                disabled={saving || !isSuperAdmin}
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
