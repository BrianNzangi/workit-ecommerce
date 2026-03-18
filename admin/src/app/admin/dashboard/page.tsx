'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { DashboardExperience } from '@/components/dashboard/DashboardExperience';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <DashboardExperience />
      </AdminLayout>
    </ProtectedRoute>
  );
}
