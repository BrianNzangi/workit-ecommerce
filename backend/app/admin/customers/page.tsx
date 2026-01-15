'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Users, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Customers</h1>
                        <p className="text-gray-600">Manage customer accounts and information</p>
                    </div>
                    <Link
                        href="/admin/customers/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Create Customer
                    </Link>
                </div>

                <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers yet</h3>
                        <p className="text-gray-600 mb-4">Customer accounts will appear here</p>
                        <Link
                            href="/admin/customers/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Your First Customer
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
