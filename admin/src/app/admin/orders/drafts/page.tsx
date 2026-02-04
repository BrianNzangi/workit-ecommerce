'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function DraftOrdersPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Draft Orders</h1>
                        <p className="text-gray-600">Create and manage draft orders</p>
                    </div>
                    <Link
                        href="/admin/orders/drafts/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Create Draft Order
                    </Link>
                </div>

                <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No draft orders yet</h3>
                        <p className="text-gray-600 mb-4">
                            Draft orders allow you to create orders on behalf of customers
                        </p>
                        <Link
                            href="/admin/orders/drafts/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Your First Draft Order
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
