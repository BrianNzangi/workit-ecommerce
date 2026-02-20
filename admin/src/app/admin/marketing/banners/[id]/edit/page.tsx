'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { BannerForm } from '@/components/admin/marketing/banners';

export default function EditBannerPage() {
    const params = useParams();
    const bannerId = Array.isArray(params.id) ? params.id[0] : params.id;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <BannerForm mode="edit" bannerId={bannerId} />
            </AdminLayout>
        </ProtectedRoute>
    );
}
