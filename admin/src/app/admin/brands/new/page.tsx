import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { BrandForm } from '@/components/admin/catalog/brands/BrandForm';

export default function NewBrandPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <BrandForm mode="create" />
            </AdminLayout>
        </ProtectedRoute>
    );
}
