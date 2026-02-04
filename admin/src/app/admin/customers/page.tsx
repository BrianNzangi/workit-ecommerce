'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CustomersList } from '@/components/admin/customers/CustomersList';

export default function CustomersPage() {
    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6 flex items-center justify-between font-sans">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Customers</h1>
                        <p className="text-sm text-gray-500 font-medium tracking-tight">Manage and view your store's customer base</p>
                    </div>
                    <Link
                        href="/admin/customers/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-lg transition-all shadow-md active:scale-95 font-bold text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Customer
                    </Link>
                </div>

                <CustomersList />
            </AdminLayout>
        </ProtectedRoute>
    );
}
