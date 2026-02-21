'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { CampaignsList } from '@/components/admin/marketing/campaigns';

export default function CampaignsPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <CampaignsList />
            </AdminLayout>
        </ProtectedRoute>
    );
}
