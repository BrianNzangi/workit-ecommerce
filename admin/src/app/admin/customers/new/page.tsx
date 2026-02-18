'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { CustomerForm } from '@/components/admin/customers/CustomerForm';

export default function NewCustomerPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <CustomerForm />
            </AdminLayout>
        </ProtectedRoute>
    );
}
