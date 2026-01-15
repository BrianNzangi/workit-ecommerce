'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DraftOrderForm } from '@/components/admin/DraftOrderForm';

export default function NewDraftOrderPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <DraftOrderForm />
            </AdminLayout>
        </ProtectedRoute>
    );
}
