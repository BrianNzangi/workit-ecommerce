'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { DraftOrderForm } from '@/components/admin/orders/DraftOrderForm';

export default function NewDraftOrderPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <DraftOrderForm />
            </AdminLayout>
        </ProtectedRoute>
    );
}
