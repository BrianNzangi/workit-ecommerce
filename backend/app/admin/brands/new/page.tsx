import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BrandForm } from '@/components/admin/BrandForm';

export default function NewBrandPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <BrandForm mode="create" />
            </AdminLayout>
        </ProtectedRoute>
    );
}
