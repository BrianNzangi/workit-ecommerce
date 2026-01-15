'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ShoppingCart } from 'lucide-react';

export default function OrdersPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders</h1>
                    <p className="text-gray-600">View and manage customer orders</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center py-12">
                        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600">Orders will appear here when customers make purchases</p>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
