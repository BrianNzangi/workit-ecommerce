'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ProductForm } from '@/components/admin/catalog/products/ProductForm';

export default function NewProductPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <ProductForm mode="create" />
            </AdminLayout>
        </ProtectedRoute>
    );
}
