'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <ProductForm mode="create" />
            </AdminLayout>
        </ProtectedRoute>
    );
}
