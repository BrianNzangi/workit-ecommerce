'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ProductForm } from '@/components/admin/catalog/products/ProductForm';

export default function EditProductPage() {
    const params = useParams();
    const productId = params.id as string;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <ProductForm mode="edit" productId={productId} />
            </AdminLayout>
        </ProtectedRoute>
    );
}
