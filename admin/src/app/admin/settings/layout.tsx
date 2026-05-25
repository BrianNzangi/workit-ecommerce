'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { SettingsProvider, SettingsHeader, SettingsActionBar } from './SettingsProvider';
import SettingsLayout from './SettingsLayout';

export default function SettingsLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <SettingsProvider>
                    <div className="w-full">
                        <SettingsHeader />
                        <SettingsLayout>
                            {children}
                        </SettingsLayout>
                    </div>
                    <SettingsActionBar />
                </SettingsProvider>
            </AdminLayout>
        </ProtectedRoute>
    );
}
