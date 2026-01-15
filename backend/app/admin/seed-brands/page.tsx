'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SeedBrandsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSeed = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/seed/brands', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || 'Failed to seed brands');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Seed Electronics Brands</h1>

                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                        <p className="text-gray-600 mb-4">
                            Click the button below to seed 25 popular electronics brands into your database.
                        </p>

                        <button
                            onClick={handleSeed}
                            disabled={loading}
                            className="w-full px-4 py-3 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs font-medium"
                        >
                            {loading ? 'Seeding Brands...' : 'Seed Brands'}
                        </button>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xs text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {result && (
                            <div className="mt-4 space-y-4">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xs">
                                    <h3 className="font-semibold text-green-900 mb-2">Success!</h3>
                                    <div className="text-sm text-green-800 space-y-1">
                                        <p>Created: {result.summary.created}</p>
                                        <p>Updated: {result.summary.updated}</p>
                                        <p>Errors: {result.summary.errors}</p>
                                        <p>Total: {result.summary.total}</p>
                                    </div>
                                </div>

                                {result.results && result.results.length > 0 && (
                                    <div className="max-h-96 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Brand
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {result.results.map((item: any, index: number) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 text-gray-900">{item.brand}</td>
                                                        <td className="px-4 py-2">
                                                            <span
                                                                className={`px-2 py-1 text-xs rounded-full ${item.status === 'created'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : item.status === 'updated'
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}
                                                            >
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-200">
                                    <a
                                        href="/admin/brands"
                                        className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xs transition-colors"
                                    >
                                        View Brands
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
