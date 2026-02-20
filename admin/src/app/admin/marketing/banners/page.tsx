'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { BannersList, BannersPageHeader } from '@/components/admin/marketing/banners';

export default function BannersPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <BannersPageHeader />
                <BannersList />
            </AdminLayout>
        </ProtectedRoute>
    );
}
