'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OrdersList } from '@/components/admin/orders/OrdersList';

export default function OrdersPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders</h1>
                    <p className="text-gray-600">View and manage customer orders</p>
                </div>

                <OrdersList />
            </AdminLayout>
        </ProtectedRoute>
    );
}
