'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { CampaignForm } from '@/components/admin/marketing/campaigns';

export default function NewCampaignPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <CampaignForm mode="create" />
            </AdminLayout>
        </ProtectedRoute>
    );
}
