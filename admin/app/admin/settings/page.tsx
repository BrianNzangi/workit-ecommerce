'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Save, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import SettingsLayout from './SettingsLayout';
import {
    GeneralTab,
    PaymentsTab,
    UsersTab,
    RolesTab,
    ShippingTab,
    TaxesTab,
    PoliciesTab,
    TabType,
    Settings,
    AdminUser,
} from './tabs';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autoSaved, setAutoSaved] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialMount = useRef(true);
    const { data: session } = useSession();

    // Get user role
    const userRole = (session?.user as any)?.role as 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | undefined;
    const isSuperAdmin = userRole === 'SUPER_ADMIN';

    // Define which tabs are viewable by non-super-admin users
    const viewOnlyTabs: TabType[] = ['general', 'policies', 'shipping'];
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
        policies: {
            return_policy: '',
            privacy_policy: '',
            privacy_policy_enabled: true,
            terms_of_service: '',
            shipping_policy: '',
            contact_required: true,
        },
    });

    // Admin Users State
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        fetchSettings();
        if (activeTab === 'users') {
            fetchAdminUsers();
        }
    }, [activeTab]);

    // Auto-save effect with debouncing
    useEffect(() => {
        // Skip auto-save on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Skip auto-save while loading
        if (loading) return;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save (1 second debounce)
        saveTimeoutRef.current = setTimeout(() => {
            handleAutoSave();
        }, 1000);

        // Cleanup on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [settings]);

    const fetchAdminUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setAdminUsers(data);
            }
        } catch (error) {
            console.error('Error fetching admin users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSave = async () => {
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setAutoSaved(true);
                setTimeout(() => setAutoSaved(false), 2000);
            }
        } catch (error) {
            console.error('Error auto-saving settings:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Settings saved successfully',
                    variant: 'success',
                });
            } else {
                const errorData = await response.json();
                console.error('Save failed:', errorData);
                toast({
                    title: 'Save failed',
                    description: errorData.message || 'Failed to save settings',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: 'Save failed',
                description: 'An error occurred while saving',
                variant: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR') => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                await fetchAdminUsers();
                toast({
                    title: 'Success',
                    description: 'User role updated successfully',
                    variant: 'success',
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Update failed',
                    description: error.error || 'Failed to update user role',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            toast({
                title: 'Update failed',
                description: 'An error occurred',
                variant: 'error',
            });
        }
    };

    const handleToggleUserStatus = async (userId: string, enabled: boolean) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled }),
            });

            if (response.ok) {
                await fetchAdminUsers();
                toast({
                    title: 'Success',
                    description: `User ${enabled ? 'enabled' : 'disabled'} successfully`,
                    variant: 'success',
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Update failed',
                    description: error.error || 'Failed to update user status',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            toast({
                title: 'Update failed',
                description: 'An error occurred',
                variant: 'error',
            });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchAdminUsers();
                toast({
                    title: 'Success',
                    description: 'User deleted successfully',
                    variant: 'success',
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Delete failed',
                    description: error.error || 'Failed to delete user',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: 'Delete failed',
                description: 'An error occurred',
                variant: 'error',
            });
        }
    };

    const handleCreateUser = async (user: {
        email: string;
        firstName: string;
        lastName: string;
        password: string;
        role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
    }) => {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        if (response.ok) {
            await fetchAdminUsers();
            toast({
                title: 'Success',
                description: 'User created successfully',
                variant: 'success',
            });
        } else {
            const error = await response.json();
            toast({
                title: 'Create failed',
                description: error.error || 'Failed to create user',
                variant: 'error',
            });
            throw new Error('Failed to create user');
        }
    };

    // Render tab content based on activeTab
    const renderTabContent = () => {
        const isReadOnly = !canEditTab(activeTab);

        switch (activeTab) {
            case 'general':
                return <GeneralTab settings={settings} setSettings={setSettings} readOnly={isReadOnly} />;
            case 'payments':
                return <PaymentsTab settings={settings} setSettings={setSettings} readOnly={isReadOnly} />;
            case 'users':
                return (
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
            case 'roles':
                return <RolesTab readOnly={isReadOnly} />;
            case 'shipping':
                return <ShippingTab readOnly={isReadOnly} />;
            case 'taxes':
                return <TaxesTab settings={settings} setSettings={setSettings} readOnly={isReadOnly} />;
            case 'policies':
                return <PoliciesTab settings={settings} setSettings={setSettings} readOnly={isReadOnly} />;
            default:
                return null;
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
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                            <p className="text-gray-600">
                                Manage your store configuration and preferences
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isSuperAdmin && (
                                <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xs">
                                    View Only - Contact Super Admin to make changes
                                </div>
                            )}
                            {autoSaved && (
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Auto-saved</span>
                                </div>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving || !isSuperAdmin}
                                className="flex items-center gap-2 bg-primary-800 text-white px-6 py-2.5 rounded-xs hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Settings Layout with Tabs */}
                    <SettingsLayout
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        canViewTab={canViewTab}
                    >
                        {renderTabContent()}
                    </SettingsLayout>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
