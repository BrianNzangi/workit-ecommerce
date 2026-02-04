'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ShoppingCart } from 'lucide-react';

export default function AbandonedCheckoutsPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Abandoned Checkouts</h1>
                    <p className="text-gray-600">View and recover abandoned customer checkouts</p>
                </div>

                <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                    <div className="text-center py-12">
                        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No abandoned checkouts</h3>
                        <p className="text-gray-600">
                            Abandoned checkouts will appear here when customers leave items in their cart
                        </p>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
