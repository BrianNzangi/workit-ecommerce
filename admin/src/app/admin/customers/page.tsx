'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { CustomersList } from '@/components/admin/customers/CustomersList';
import { CustomersPageHeader } from '@/components/admin/customers/CustomersPageHeader';

export default function CustomersPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <CustomersPageHeader />
                <CustomersList />
            </AdminLayout>
        </ProtectedRoute>
    );
}
