'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CustomerForm } from '@/components/admin/CustomerForm';

export default function NewCustomerPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <CustomerForm />
            </AdminLayout>
        </ProtectedRoute>
    );
}
