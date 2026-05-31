'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ShoppingCart } from 'lucide-react';

export default function AbandonedCheckoutsPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-8 bg-white rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Abandoned Checkouts</h1>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white py-16 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                            <ShoppingCart className="h-6 w-6 text-gray-300" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">No abandoned checkouts</h3>
                        <p className="mt-1 max-w-sm text-sm text-gray-500">
                            Abandoned checkouts will appear here when customers leave items in their cart without completing purchase.
                        </p>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
