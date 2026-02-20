'use client';

import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { CustomerForm } from '@/components/admin/customers/CustomerForm';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';

export default function EditCustomerPage() {
    const params = useParams();
    const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <CustomerForm mode="edit" customerId={customerId} />
            </AdminLayout>
        </ProtectedRoute>
    );
}
