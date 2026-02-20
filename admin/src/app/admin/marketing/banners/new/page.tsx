'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { BannerForm } from '@/components/admin/marketing/banners';

export default function NewBannerPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <BannerForm mode="create" />
            </AdminLayout>
        </ProtectedRoute>
    );
}
