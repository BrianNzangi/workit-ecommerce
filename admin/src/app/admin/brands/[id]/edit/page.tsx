import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BrandForm } from '@/components/admin/BrandForm';

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <BrandForm mode="edit" brandId={id} />
            </AdminLayout>
        </ProtectedRoute>
    );
}
