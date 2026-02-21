'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { CampaignForm } from '@/components/admin/marketing/campaigns';

export default function EditCampaignPage() {
    const { id } = useParams() as { id: string };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <CampaignForm mode="edit" campaignId={id} />
            </AdminLayout>
        </ProtectedRoute>
    );
}
